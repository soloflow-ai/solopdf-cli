use super::*;
use crate::test_utils::{create_test_pdf, save_test_pdf};
use crate::page_count::get_page_count;
use tempfile::NamedTempFile;
use std::fs;

#[test]
fn test_get_pdf_info_before_signing_single_page() {
    let doc = create_test_pdf(1, "Info Test", "Test content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    let result = get_pdf_info_before_signing(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 1);
}

#[test]
fn test_get_pdf_info_before_signing_multiple_pages() {
    let doc = create_test_pdf(3, "Multi Info Test", "Content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    let result = get_pdf_info_before_signing(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 3);
}

#[test]
fn test_get_pdf_info_before_signing_nonexistent_file() {
    let result = get_pdf_info_before_signing("/nonexistent/file.pdf".to_string());
    assert!(result.is_err());
}

#[test]
fn test_sign_pdf_basic() {
    let doc = create_test_pdf(1, "Sign Test", "Document to be signed").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    let signature_text = "John Doe - Digital Signature";
    let result = sign_pdf(path.clone(), signature_text.to_string());
    assert!(result.is_ok());
    
    // Verify the document can still be loaded after signing
    let signed_doc = lopdf::Document::load(&path);
    assert!(signed_doc.is_ok());
    
    // Verify page count remains the same
    let page_count = get_page_count(path);
    assert!(page_count.is_ok());
    assert_eq!(page_count.unwrap(), 1);
}

#[test]
fn test_sign_pdf_multi_page() {
    let doc = create_test_pdf(5, "Multi-page Sign Test", "Pages to sign").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    let signature_text = "Jane Smith - Authorized Signature";
    let result = sign_pdf(path.clone(), signature_text.to_string());
    assert!(result.is_ok());
    
    // Verify page count remains the same after signing
    let page_count = get_page_count(path);
    assert!(page_count.is_ok());
    assert_eq!(page_count.unwrap(), 5);
}

#[test]
fn test_sign_pdf_empty_signature() {
    let doc = create_test_pdf(1, "Empty Sig Test", "Content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    let result = sign_pdf(path, "".to_string());
    assert!(result.is_ok()); // Should handle empty signature gracefully
}

#[test]
fn test_sign_pdf_long_signature() {
    let doc = create_test_pdf(1, "Long Sig Test", "Content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    let long_signature = "A".repeat(1000); // Very long signature
    let result = sign_pdf(path, long_signature);
    assert!(result.is_ok());
}

#[test]
fn test_sign_pdf_special_characters() {
    let doc = create_test_pdf(1, "Special Chars Test", "Content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    let special_signature = "John Döe - Signature with émojis 🖊️ and spëcial chars!";
    let result = sign_pdf(path, special_signature.to_string());
    assert!(result.is_ok());
}

#[test]
fn test_sign_pdf_nonexistent_file() {
    let result = sign_pdf("/nonexistent/file.pdf".to_string(), "Signature".to_string());
    assert!(result.is_err());
}

#[test]
fn test_sign_pdf_invalid_file() {
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    // Write invalid PDF content
    fs::write(&path, b"This is not a PDF file").unwrap();
    
    let result = sign_pdf(path, "Signature".to_string());
    assert!(result.is_err());
}

#[test]
fn test_sign_pdf_readonly_file() {
    let doc = create_test_pdf(1, "Readonly Test", "Content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    // Make file readonly
    let mut perms = fs::metadata(&path).unwrap().permissions();
    perms.set_readonly(true);
    fs::set_permissions(&path, perms).unwrap();
    
    let result = sign_pdf(path.clone(), "Signature".to_string());
    // This should fail because we can't write to readonly file
    assert!(result.is_err());
    
    // Clean up - make writable again for temp file cleanup
    let mut perms = fs::metadata(&path).unwrap().permissions();
    perms.set_readonly(false);
    fs::set_permissions(&path, perms).unwrap();
}

#[test]
fn test_integration_get_info_then_sign() {
    let doc = create_test_pdf(3, "Integration Test", "Full workflow test").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&doc, &path).unwrap();
    
    // First get info
    let info_result = get_pdf_info_before_signing(path.clone());
    assert!(info_result.is_ok());
    assert_eq!(info_result.unwrap(), 3);
    
    // Then sign
    let sign_result = sign_pdf(path.clone(), "Integration Test Signature".to_string());
    assert!(sign_result.is_ok());
    
    // Verify page count is still correct after signing
    let final_count = get_page_count(path);
    assert!(final_count.is_ok());
    assert_eq!(final_count.unwrap(), 3);
}
