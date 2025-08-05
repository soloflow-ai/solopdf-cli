use napi_derive::napi;

// Declare modules
#[path = "page-count.rs"]
pub mod page_count;
pub mod sign;

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
    options: Option<SigningOptions>
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
