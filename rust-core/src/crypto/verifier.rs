use crate::crypto::key_manager::KeyPair;
use crate::crypto::signer::{SignatureInfo, SignedDocument};
use base64::{engine::general_purpose, Engine as _};
use ring::{digest, signature};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Read;

#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationResult {
    pub is_valid: bool,
    pub message: String,
    pub signature_info: Option<SignatureInfo>,
    pub verified_at: String,
}

/// Verify a digital signature using the public key
pub fn verify_signature(
    file_path: &str,
    signature_info: &SignatureInfo,
    public_key: &str,
) -> Result<VerificationResult, Box<dyn std::error::Error>> {
    // 1. Generate current hash of the file
    let current_hash = generate_file_hash(file_path)?;

    // 2. Check if the file hash matches the signed hash
    if current_hash != signature_info.hash {
        return Ok(VerificationResult {
            is_valid: false,
            message: "Document has been modified since signing".to_string(),
            signature_info: Some(signature_info.clone()),
            verified_at: chrono::Utc::now()
                .format("%Y-%m-%d %H:%M:%S UTC")
                .to_string(),
        });
    }

    // 3. Verify the signature using the public key
    let public_key_bytes = general_purpose::STANDARD
        .decode(public_key)
        .map_err(|e| format!("Failed to decode public key: {e}"))?;

    let signature_bytes = general_purpose::STANDARD
        .decode(&signature_info.signature)
        .map_err(|e| format!("Failed to decode signature: {e}"))?;

    let hash_bytes = general_purpose::STANDARD.decode(&signature_info.hash)?;

    // Create verification key
    let verification_key =
        signature::UnparsedPublicKey::new(&signature::ECDSA_P256_SHA256_FIXED, &public_key_bytes);

    // Verify the signature
    match verification_key.verify(&hash_bytes, &signature_bytes) {
        Ok(()) => Ok(VerificationResult {
            is_valid: true,
            message: "Signature is valid and document is authentic".to_string(),
            signature_info: Some(signature_info.clone()),
            verified_at: chrono::Utc::now()
                .format("%Y-%m-%d %H:%M:%S UTC")
                .to_string(),
        }),
        Err(_) => Ok(VerificationResult {
            is_valid: false,
            message: "Invalid signature - document may be tampered or signed with different key"
                .to_string(),
            signature_info: Some(signature_info.clone()),
            verified_at: chrono::Utc::now()
                .format("%Y-%m-%d %H:%M:%S UTC")
                .to_string(),
        }),
    }
}

/// Verify a signed document using a key pair
pub fn verify_signed_document(
    signed_doc: &SignedDocument,
    key_pair: &KeyPair,
) -> Result<VerificationResult, Box<dyn std::error::Error>> {
    verify_signature(
        &signed_doc.signed_file,
        &signed_doc.signature_info,
        &key_pair.public_key,
    )
}

/// Verify a signed document using just the public key
pub fn verify_with_public_key(
    file_path: &str,
    signature_info: &SignatureInfo,
    public_key: &str,
) -> Result<VerificationResult, Box<dyn std::error::Error>> {
    verify_signature(file_path, signature_info, public_key)
}

/// Load and verify a signed document from signature file
pub fn load_and_verify_signature(
    signature_file_path: &str,
    public_key: &str,
) -> Result<VerificationResult, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(signature_file_path)?;
    let signed_doc: SignedDocument = serde_json::from_str(&content)?;

    verify_signature(
        &signed_doc.signed_file,
        &signed_doc.signature_info,
        public_key,
    )
}

/// Generate hash of a file
fn generate_file_hash(file_path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let mut file_content = Vec::new();
    let mut file = fs::File::open(file_path)?;
    file.read_to_end(&mut file_content)?;

    let hash = digest::digest(&digest::SHA256, &file_content);
    Ok(general_purpose::STANDARD.encode(hash.as_ref()))
}

/// Get checksum of a file for user verification
pub fn get_file_checksum(file_path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let hash = generate_file_hash(file_path)?;
    // Return first 16 characters for user-friendly verification
    Ok(hash[..16].to_string())
}
