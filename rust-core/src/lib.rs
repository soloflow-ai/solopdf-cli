use napi_derive::napi;

// Declare modules
#[path = "page-count.rs"]
pub mod page_count;
pub mod sign;

// Re-export the functions for easy access with NAPI annotations
#[napi]
pub fn get_page_count(file_path: String) -> napi::Result<u32> {
    page_count::get_page_count(file_path)
}

#[napi]
pub fn sign_pdf(file_path: String, signature_text: String) -> napi::Result<()> {
    sign::sign_pdf(file_path, signature_text)
}

#[napi]
pub fn get_pdf_info_before_signing(file_path: String) -> napi::Result<u32> {
    sign::get_pdf_info_before_signing(file_path)
}