use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub fn get_page_count(file_path: String) -> Result<u32> {
    // Use the lopdf crate to load the PDF document from the given file path.
    let doc = lopdf::Document::load(file_path);
    let document = match doc {
        Ok(document) => document,
        Err(e) => return Err(napi::Error::new(napi::Status::GenericFailure, e.to_string())),
    };
    // Get the number of pages in the document.
    let page_count = document.get_pages().len() as u32;

    // Return the page count, wrapped in a `Result` to signal success.
    Ok(page_count)
}