use base64::{engine::general_purpose, Engine as _};
use ring::signature::KeyPair as RingKeyPair;
use ring::{rand, signature};
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KeyPair {
    pub private_key: String,
    pub public_key: String,
    pub algorithm: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KeyInfo {
    pub public_key: String,
    pub algorithm: String,
    pub fingerprint: String,
}

/// Generate a new ECDSA P-256 key pair for digital signing
pub fn generate_key_pair() -> Result<KeyPair, Box<dyn std::error::Error>> {
    let rng = rand::SystemRandom::new();

    // Generate PKCS8 private key
    let pkcs8_bytes =
        signature::EcdsaKeyPair::generate_pkcs8(&signature::ECDSA_P256_SHA256_FIXED_SIGNING, &rng)
            .map_err(|e| format!("Failed to generate key pair: {e:?}"))?;

    // Create key pair to extract public key
    let key_pair = signature::EcdsaKeyPair::from_pkcs8(
        &signature::ECDSA_P256_SHA256_FIXED_SIGNING,
        pkcs8_bytes.as_ref(),
        &rng,
    )
    .map_err(|e| format!("Failed to create key pair: {e:?}"))?;

    // Encode keys in base64
    let private_key = general_purpose::STANDARD.encode(pkcs8_bytes.as_ref());
    let public_key = general_purpose::STANDARD.encode(key_pair.public_key().as_ref());

    let created_at = chrono::Utc::now()
        .format("%Y-%m-%d %H:%M:%S UTC")
        .to_string();

    Ok(KeyPair {
        private_key,
        public_key,
        algorithm: "ECDSA_P256_SHA256".to_string(),
        created_at,
    })
}

/// Save key pair to a file
pub fn save_key_pair(
    key_pair: &KeyPair,
    file_path: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let json = serde_json::to_string_pretty(key_pair)?;
    fs::write(file_path, json)?;
    Ok(())
}

/// Load key pair from a file
pub fn load_key_pair(file_path: &str) -> Result<KeyPair, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(file_path)?;
    let key_pair: KeyPair = serde_json::from_str(&content)?;
    Ok(key_pair)
}

/// Load key pair from base64 string
pub fn load_key_pair_from_string(
    private_key_b64: &str,
) -> Result<KeyPair, Box<dyn std::error::Error>> {
    let rng = rand::SystemRandom::new();

    // Decode private key
    let pkcs8_bytes = general_purpose::STANDARD
        .decode(private_key_b64)
        .map_err(|e| format!("Failed to decode private key: {e}"))?;

    // Create key pair to extract public key
    let key_pair = signature::EcdsaKeyPair::from_pkcs8(
        &signature::ECDSA_P256_SHA256_FIXED_SIGNING,
        &pkcs8_bytes,
        &rng,
    )
    .map_err(|e| format!("Failed to create key pair: {e:?}"))?;

    let public_key = general_purpose::STANDARD.encode(key_pair.public_key().as_ref());

    Ok(KeyPair {
        private_key: private_key_b64.to_string(),
        public_key,
        algorithm: "ECDSA_P256_SHA256".to_string(),
        created_at: "Loaded from string".to_string(),
    })
}

/// Get key information (without private key)
pub fn get_key_info(key_pair: &KeyPair) -> Result<KeyInfo, Box<dyn std::error::Error>> {
    // Create a simple fingerprint using SHA-256 of the public key
    use ring::digest;
    let public_key_bytes = general_purpose::STANDARD.decode(&key_pair.public_key)?;
    let fingerprint_bytes = digest::digest(&digest::SHA256, &public_key_bytes);
    let fingerprint = general_purpose::STANDARD.encode(fingerprint_bytes.as_ref());

    Ok(KeyInfo {
        public_key: key_pair.public_key.clone(),
        algorithm: key_pair.algorithm.clone(),
        fingerprint,
    })
}
