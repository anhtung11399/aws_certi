# Lấy giọng đọc cho nhiều câu một lượt (edge-tts, giọng neural miễn phí của Microsoft).
# Dịch vụ hay trả lỗi ngẫu nhiên → thử lại nhanh, lỗi liên tiếp nhiều lần thì nghỉ một lúc rồi thử tiếp.
# Dùng: python tts_batch.py jobs.json   (jobs.json = [{"text": "...", "out": "/đường/dẫn.mp3"}, ...])
import asyncio
import json
import os
import sys

import edge_tts

VOICE = os.environ.get("VOICE", "vi-VN-HoaiMyNeural")
RATE = os.environ.get("RATE", "+5%")
WORKERS = 2


async def synth(text, out):
    data = bytearray()
    async for ch in edge_tts.Communicate(text, VOICE, rate=RATE).stream():
        if ch["type"] == "audio":
            data += ch["data"]
    if len(data) < 1000:
        raise RuntimeError("ít dữ liệu")
    tmp = out + ".part"
    with open(tmp, "wb") as f:
        f.write(data)
    os.replace(tmp, out)


async def main(path):
    jobs = [j for j in json.load(open(path)) if not os.path.exists(j["out"])]
    q = asyncio.Queue()
    for j in jobs:
        q.put_nowait(j)
    state = {"streak": 0, "done": 0}

    async def worker():
        while not q.empty():
            j = await q.get()
            for attempt in range(200):
                try:
                    await asyncio.wait_for(synth(j["text"], j["out"]), 60)
                    state["streak"] = 0
                    state["done"] += 1
                    break
                except Exception:
                    state["streak"] += 1
                    # lỗi liên tiếp nhiều → dịch vụ đang chặn, nghỉ lâu hơn
                    await asyncio.sleep(45 if state["streak"] % 12 == 0 else 1.0)
            else:
                print("BỎ:", j["text"][:60], file=sys.stderr)

    await asyncio.gather(*(worker() for _ in range(WORKERS)))
    print(f"tts: {state['done']}/{len(jobs)} câu mới")


asyncio.run(main(sys.argv[1]))
