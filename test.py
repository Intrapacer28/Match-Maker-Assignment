import json

# Load the keypair file
with open(r'C:\Users\1234p\Videos\Blockchain-Project\marketmaker-main\marketmaker-main\new-wallet.json') as f:
    keypair = json.load(f)

# Convert the private key array to hex format
private_key_bytes = bytes(keypair)
private_key_hex = private_key_bytes.hex()

print("Private Key in Hex:", private_key_hex)
