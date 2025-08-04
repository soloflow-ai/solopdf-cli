#[cfg(not(test))]
use napi::bindgen_prelude::*;

pub fn get_page_count_internal(file_path: String) -> Result<u32, Box<dyn std::error::Error>> {
    let document = lopdf::Document::load(file_path)?;
    let page_count = document.get_pages().len() as u32;
    Ok(page_count)
}

#[cfg(not(test))]
pub fn get_page_count(file_path: String) -> napi::Result<u32> {
    match get_page_count_internal(file_path) {
        Ok(count) => Ok(count),
        Err(e) => Err(napi::Error::new(napi::Status::GenericFailure, e.to_string())),
    }
}

#[cfg(test)]
pub fn get_page_count(file_path: String) -> Result<u32, Box<dyn std::error::Error>> {
    get_page_count_internal(file_path)
}