use napi_derive::napi;

// Declare modules
#[cfg(feature = "crypto")]
pub mod crypto;
#[path = "page-count.rs"]
pub mod page_count;
pub mod sign;

#[cfg(feature = "crypto")]
pub use crypto::*;

// Re-export SigningOptions from sign module
pub use sign::SigningOptions;

// Test utilities module for internal use
#[cfg(any(test, feature = "test-utils"))]
pub mod test_utils;

// Re-export the functions for easy access with NAPI annotations
#[napi]
pub fn get_page_count(file_path: String) -> napi::Result<u32> {
    page_count::get_page_count(file_path)
}

/// Generate a new cryptographic key pair for digital signing
#[cfg(feature = "crypto")]
#[napi]
pub fn generate_signing_key_pair() -> napi::Result<String> {
    let key_pair = crypto::generate_key_pair()
        .map_err(|e| napi::Error::from_reason(format!("Key generation failed: {e}")))?;

    serde_json::to_string_pretty(&key_pair)
        .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {e}")))
}

/// Get key information (public key and fingerprint) from a key pair JSON
#[cfg(feature = "crypto")]
#[napi]
pub fn get_key_info_from_json(key_pair_json: String) -> napi::Result<String> {
    let key_pair: crypto::KeyPair = serde_json::from_str(&key_pair_json)
        .map_err(|e| napi::Error::from_reason(format!("Invalid key pair JSON: {e}")))?;

    let key_info = crypto::get_key_info(&key_pair)
        .map_err(|e| napi::Error::from_reason(format!("Failed to get key info: {e}")))?;

    serde_json::to_string_pretty(&key_info)
        .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {e}")))
}

/// Sign a PDF with digital signature using a private key
#[cfg(feature = "crypto")]
#[napi]
pub fn sign_pdf_with_key(
    input_path: String,
    output_path: String,
    private_key_b64: String,
    signature_text: Option<String>,
) -> napi::Result<String> {
    let key_pair = crypto::load_key_pair_from_string(&private_key_b64)
        .map_err(|e| napi::Error::from_reason(format!("Invalid private key: {e}")))?;

    let signed_doc = crypto::sign_pdf_digitally(
        &input_path,
        &output_path,
        &key_pair,
        signature_text.as_deref(),
    )
    .map_err(|e| napi::Error::from_reason(format!("Signing failed: {e}")))?;

    serde_json::to_string_pretty(&signed_doc)
        .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {e}")))
}

/// Verify a digital signature
#[cfg(feature = "crypto")]
#[napi]
pub fn verify_pdf_signature(
    file_path: String,
    signature_info_json: String,
    public_key_b64: String,
) -> napi::Result<String> {
    let signature_info: crypto::SignatureInfo = serde_json::from_str(&signature_info_json)
        .map_err(|e| napi::Error::from_reason(format!("Invalid signature info: {e}")))?;

    let result = crypto::verify_signature(&file_path, &signature_info, &public_key_b64)
        .map_err(|e| napi::Error::from_reason(format!("Verification failed: {e}")))?;

    serde_json::to_string_pretty(&result)
        .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {e}")))
}

/// Get file checksum for user verification
#[cfg(feature = "crypto")]
#[napi]
pub fn get_pdf_checksum(file_path: String) -> napi::Result<String> {
    crypto::get_file_checksum(&file_path)
        .map_err(|e| napi::Error::from_reason(format!("Checksum generation failed: {e}")))
}

#[napi]
pub fn sign_pdf(file_path: String, signature_text: String) -> napi::Result<()> {
    sign::sign_pdf_with_visible_text(file_path, signature_text)
}

#[napi]
pub fn sign_pdf_legacy(file_path: String, signature_text: String) -> napi::Result<()> {
    sign::sign_pdf_legacy(file_path, signature_text)
}

#[napi]
pub fn sign_pdf_with_visible_text(file_path: String, signature_text: String) -> napi::Result<()> {
    sign::sign_pdf_with_visible_text(file_path, signature_text)
}

#[napi]
pub fn sign_pdf_with_options(
    file_path: String,
    signature_text: String,
    options: Option<SigningOptions>,
) -> napi::Result<()> {
    sign::sign_pdf_with_options(file_path, signature_text, options)
}

#[napi]
pub fn get_pdf_info_before_signing(file_path: String) -> napi::Result<u32> {
    sign::get_pdf_info_before_signing(file_path)
}

// Export non-NAPI versions for internal testing
pub fn get_page_count_internal(
    file_path: String,
) -> std::result::Result<u32, Box<dyn std::error::Error>> {
    page_count::get_page_count_internal(file_path)
}

pub fn sign_pdf_internal(
    file_path: String,
    signature_text: String,
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    sign::sign_pdf_internal(file_path, signature_text)
}

pub fn get_pdf_info_before_signing_internal(
    file_path: String,
) -> std::result::Result<u32, Box<dyn std::error::Error>> {
    sign::get_pdf_info_before_signing_internal(file_path)
}
