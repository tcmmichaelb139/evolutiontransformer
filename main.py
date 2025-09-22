import time
from transformers import AutoConfig, AutoTokenizer, AutoModelForCausalLM

start = time.time()
model = AutoModelForCausalLM.from_pretrained("tcmmichaelb139/gpt2-medium-tinystories")
print(model)

print("Loaded model in", time.time() - start)
