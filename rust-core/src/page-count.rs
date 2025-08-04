use napi::bindgen_prelude::*;

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

// Internal version for testing that returns standard Result
pub fn get_page_count_internal(file_path: String) -> std::result::Result<u32, Box<dyn std::error::Error>> {
    let doc = lopdf::Document::load(file_path)?;
    let page_count = doc.get_pages().len() as u32;
    Ok(page_count)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::create_test_pdf;
    use tempfile::NamedTempFile;

    #[test]
    fn test_page_count_single_page() {
        let mut doc = create_test_pdf(1, "test", "content").unwrap();
        let temp_file = NamedTempFile::new().unwrap();
        let path = temp_file.path().to_string_lossy().to_string();
        doc.save(&path).unwrap();
        
        let result = get_page_count_internal(path);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 1);
    }

    #[test]
    fn test_page_count_multiple_pages() {
        let mut doc = create_test_pdf(3, "test", "content").unwrap();
        let temp_file = NamedTempFile::new().unwrap();
        let path = temp_file.path().to_string_lossy().to_string();
        doc.save(&path).unwrap();
        
        let result = get_page_count_internal(path);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 3);
    }

    #[test]
    fn test_page_count_nonexistent_file() {
        let result = get_page_count_internal("/nonexistent/file.pdf".to_string());
        assert!(result.is_err());
    }
}