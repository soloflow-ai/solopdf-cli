use super::*;
use crate::test_utils::{create_test_pdf, save_test_pdf};
use tempfile::NamedTempFile;
use std::fs;

#[test]
fn test_get_page_count_single_page() {
    let mut doc = create_test_pdf(1, "Single Page Test", "Test content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = get_page_count(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 1);
}

#[test]
fn test_get_page_count_multiple_pages() {
    let mut doc = create_test_pdf(5, "Multi Page Test", "Test content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = get_page_count(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 5);
}

#[test]
fn test_get_page_count_empty_document() {
    let mut doc = create_test_pdf(0, "Empty Test", "").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = get_page_count(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 0);
}

#[test]
fn test_get_page_count_nonexistent_file() {
    let result = get_page_count("/nonexistent/file.pdf".to_string());
    assert!(result.is_err());
}

#[test]
fn test_get_page_count_invalid_file() {
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    // Write invalid PDF content
    fs::write(&path, b"This is not a PDF file").unwrap();
    
    let result = get_page_count(path);
    assert!(result.is_err());
}

#[test]
fn test_get_page_count_large_document() {
    let doc = create_test_pdf(100, "Large Document Test", "Lots of content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    let result = get_page_count(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 100);
}
