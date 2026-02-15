# MARZ Sovereign Voice Profile
VOICE_PARAMS = {
    "model_name": "tts_models/multilingual/multi-dataset/xtts_v2",
    "temperature": 0.75,
    "length_penalty": 1.0,
    "repetition_penalty": 5.0,
    "top_k": 50,
    "top_p": 0.85,
    "emotion": "Neutral-Calm",
    "speed": 1.05,
}


def apply_wit_filter(text: str) -> str:
    """
    Subtly injects conversational filler or punctuation to
    guide the TTS engine into a more human cadence.
    """
    text = text.replace("I am", "I'm")
    text = text.replace("cannot", "can't")
    if len(text) > 100:
        text = text.replace(". ", "... ", 1)
    return text
