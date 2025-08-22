use crate::crypto::key_manager::KeyPair;
use crate::sign::sign_pdf_with_visible_text;
use base64::{engine::general_purpose, Engine as _};
use ring::{digest, rand, signature};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Read;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SignatureInfo {
    pub signature: String,
    pub hash: String,
    pub algorithm: String,
    pub timestamp: String,
    pub signer_fingerprint: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignedDocument {
    pub original_file: String,
    pub signed_file: String,
    pub signature_info: SignatureInfo,
}

/// Generate a cryptographic hash of the PDF content
pub fn generate_pdf_hash(file_path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let mut file_content = Vec::new();
    let mut file = fs::File::open(file_path)?;
    file.read_to_end(&mut file_content)?;

    let hash = digest::digest(&digest::SHA256, &file_content);
    Ok(general_purpose::STANDARD.encode(hash.as_ref()))
}

/// Sign a PDF with a digital signature and visible marks
pub fn sign_pdf_digitally(
    input_path: &str,
    output_path: &str,
    key_pair: &KeyPair,
    signature_text: Option<&str>,
) -> Result<SignedDocument, Box<dyn std::error::Error>> {
    // 1. Generate hash of the original document
    let document_hash = generate_pdf_hash(input_path)?;

    // 2. Create signature using the private key
    let rng = rand::SystemRandom::new();

    // Decode private key
    let pkcs8_bytes = general_purpose::STANDARD
        .decode(&key_pair.private_key)
        .map_err(|e| format!("Failed to decode private key: {e}"))?;

    // Create signing key
    let signing_key = signature::EcdsaKeyPair::from_pkcs8(
        &signature::ECDSA_P256_SHA256_FIXED_SIGNING,
        &pkcs8_bytes,
        &rng,
    )
    .map_err(|e| format!("Failed to create signing key: {e:?}"))?;

    // Sign the document hash
    let hash_bytes = general_purpose::STANDARD.decode(&document_hash)?;
    let signature_bytes = signing_key
        .sign(&rng, &hash_bytes)
        .map_err(|e| format!("Failed to sign document: {e:?}"))?;

    let signature_b64 = general_purpose::STANDARD.encode(signature_bytes.as_ref());

    // 3. Create signer fingerprint
    let signer_fingerprint = {
        let public_key_bytes = general_purpose::STANDARD.decode(&key_pair.public_key)?;
        let fingerprint_hash = digest::digest(&digest::SHA256, &public_key_bytes);
        general_purpose::STANDARD.encode(fingerprint_hash.as_ref())
    };

    // 4. Copy the PDF to output location
    fs::copy(input_path, output_path)?;

    // 5. Add visible signature using existing function
    let visible_text = signature_text.unwrap_or("DIGITALLY SIGNED");
    sign_pdf_with_visible_text(output_path.to_string(), visible_text.to_string())
        .map_err(|e| format!("Failed to add visible signature: {e:?}"))?;

    // 6. Create signature info
    let signature_info = SignatureInfo {
        signature: signature_b64,
        hash: document_hash,
        algorithm: "ECDSA_P256_SHA256".to_string(),
        timestamp: chrono::Utc::now()
            .format("%Y-%m-%d %H:%M:%S UTC")
            .to_string(),
        signer_fingerprint,
    };

    Ok(SignedDocument {
        original_file: input_path.to_string(),
        signed_file: output_path.to_string(),
        signature_info,
    })
}

/// Save signature information to a file
pub fn save_signature_info(
    signed_doc: &SignedDocument,
    file_path: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let json = serde_json::to_string_pretty(signed_doc)?;
    fs::write(file_path, json)?;
    Ok(())
}
