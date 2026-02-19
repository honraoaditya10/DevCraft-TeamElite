import json
import sys
from knowledge_base import BOT_KB


def normalize(text):
    return "" if text is None else text.strip().lower()


def extract_keywords(text):
    tokens = []
    for part in text.replace("/", " ").replace("-", " ").split():
        clean = "".join(ch for ch in part if ch.isalnum())
        if clean:
            tokens.append(clean.lower())
    return set(tokens)


def generate_reply(message):
    text = normalize(message)
    if not text:
        return {
            "reply": "Share a question about documents, profile, or schemes.",
            "matched": []
        }

    tokens = extract_keywords(text)
    matched = []
    for item in BOT_KB:
        if any(tag in tokens for tag in item.get("tags", [])):
            matched.append(item)

    if matched:
        top = matched[0]
        return {
            "reply": top.get("answer", "I can help with documents, profile, or schemes."),
            "matched": [m.get("id") for m in matched]
        }

    return {
        "reply": "I can help with documents, profile updates, or scheme eligibility.",
        "matched": []
    }


def main():
    message = ""
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
    else:
        try:
            message = sys.stdin.read()
        except Exception:
            message = ""

    result = generate_reply(message)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
