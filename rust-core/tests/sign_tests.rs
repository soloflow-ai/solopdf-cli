use rust_core::{sign_pdf_internal, get_pdf_info_before_signing_internal};
use rust_core::page_count::get_page_count_internal;
use tempfile::NamedTempFile;
use std::fs;
use lopdf::{Document, Object, Stream, dictionary};

// Test utility functions
fn create_test_pdf(page_count: usize, title: &str, content: &str) -> Result<Document, Box<dyn std::error::Error>> {
    let mut doc = Document::with_version("1.4");
    
    let pages_id = doc.new_object_id();
    let font_id = doc.new_object_id();
    
    // Root catalog
    let catalog_id = doc.add_object(dictionary! {
        "Type" => "Catalog",
        "Pages" => pages_id,
    });
    doc.trailer.set("Root", catalog_id);
    
    // Font
    doc.objects.insert(font_id, Object::Dictionary(dictionary! {
        "Type" => "Font",
        "Subtype" => "Type1",
        "BaseFont" => "Helvetica",
    }));
    
    let mut page_ids = Vec::new();
    
    for i in 0..page_count.max(1) {
        let page_id = doc.new_object_id();
        let content_id = doc.new_object_id();
        
        // Content stream
        let page_content = if page_count > 1 {
            format!("BT /F1 12 Tf 72 720 Td ({} - Page {}) Tj ET", content, i + 1)
        } else {
            format!("BT /F1 12 Tf 72 720 Td ({}) Tj ET", content)
        };
        
        doc.objects.insert(content_id, Object::Stream(Stream::new(
            dictionary! {},
            page_content.into_bytes(),
        )));
        
        // Page
        doc.objects.insert(page_id, Object::Dictionary(dictionary! {
            "Type" => "Page",
            "Parent" => pages_id,
            "MediaBox" => vec![0.into(), 0.into(), 612.into(), 792.into()],
            "Contents" => content_id,
            "Resources" => dictionary! {
                "Font" => dictionary! {
                    "F1" => font_id,
                },
            },
        }));
        
        page_ids.push(page_id.into());
    }
    
    // Pages
    doc.objects.insert(pages_id, Object::Dictionary(dictionary! {
        "Type" => "Pages",
        "Kids" => page_ids,
        "Count" => page_count.max(1) as i64,
    }));
    
    Ok(doc)
}

fn save_test_pdf(doc: &mut Document, file_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    doc.save(file_path)?;
    Ok(())
}

#[test]
fn test_get_pdf_info_before_signing_single_page() {
    let mut doc = create_test_pdf(1, "Info Test", "Test content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = get_pdf_info_before_signing_internal(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 1);
}

#[test]
fn test_get_pdf_info_before_signing_multiple_pages() {
    let mut doc = create_test_pdf(3, "Multi Info Test", "Content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = get_pdf_info_before_signing_internal(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 3);
}

#[test]
fn test_get_pdf_info_before_signing_nonexistent_file() {
    let result = get_pdf_info_before_signing_internal("/nonexistent/file.pdf".to_string());
    assert!(result.is_err());
}

#[test]
fn test_sign_pdf_basic() {
    let mut doc = create_test_pdf(1, "Sign Test", "Document to be signed").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let signature_text = "John Doe - Digital Signature";
    let result = sign_pdf_internal(path.clone(), signature_text.to_string());
    assert!(result.is_ok());
    
    // Verify the document can still be loaded after signing
    let signed_doc = lopdf::Document::load(&path);
    assert!(signed_doc.is_ok());
    
    // Verify page count remains the same
    let page_count = get_page_count_internal(path);
    assert!(page_count.is_ok());
    assert_eq!(page_count.unwrap(), 1);
}

#[test]
fn test_sign_pdf_multi_page() {
    let mut doc = create_test_pdf(5, "Multi-page Sign Test", "Pages to sign").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let signature_text = "Jane Smith - Authorized Signature";
    let result = sign_pdf_internal(path.clone(), signature_text.to_string());
    assert!(result.is_ok());
    
    // Verify page count remains the same after signing
    let page_count = get_page_count_internal(path);
    assert!(page_count.is_ok());
    assert_eq!(page_count.unwrap(), 5);
}

#[test]
fn test_sign_pdf_empty_signature() {
    let mut doc = create_test_pdf(1, "Empty Sig Test", "Content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = sign_pdf_internal(path, "".to_string());
    assert!(result.is_ok()); // Should handle empty signature gracefully
}

#[test]
fn test_sign_pdf_long_signature() {
    let mut doc = create_test_pdf(1, "Long Sig Test", "Content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let long_signature = "A".repeat(1000); // Very long signature
    let result = sign_pdf_internal(path, long_signature);
    assert!(result.is_ok());
}

#[test]
fn test_sign_pdf_special_characters() {
    let mut doc = create_test_pdf(1, "Special Chars Test", "Content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let special_signature = "John Döe - Signature with émojis 🖊️ and spëcial chars!";
    let result = sign_pdf_internal(path, special_signature.to_string());
    assert!(result.is_ok());
}

#[test]
fn test_sign_pdf_nonexistent_file() {
    let result = sign_pdf_internal("/nonexistent/file.pdf".to_string(), "Signature".to_string());
    assert!(result.is_err());
}

#[test]
fn test_sign_pdf_invalid_file() {
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    // Write invalid PDF content
    fs::write(&path, b"This is not a PDF file").unwrap();
    
    let result = sign_pdf_internal(path, "Signature".to_string());
    assert!(result.is_err());
}

#[test]
fn test_integration_get_info_then_sign() {
    let mut doc = create_test_pdf(3, "Integration Test", "Full workflow test").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    // First get info
    let info_result = get_pdf_info_before_signing_internal(path.clone());
    assert!(info_result.is_ok());
    assert_eq!(info_result.unwrap(), 3);
    
    // Then sign
    let sign_result = sign_pdf_internal(path.clone(), "Integration Test Signature".to_string());
    assert!(sign_result.is_ok());
    
    // Verify page count is still correct after signing
    let final_count = get_page_count_internal(path);
    assert!(final_count.is_ok());
    assert_eq!(final_count.unwrap(), 3);
}

#[test]
fn test_multiple_signatures() {
    let mut doc = create_test_pdf(2, "Multi Sign Test", "Test multiple signatures").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    // First signature
    let result1 = sign_pdf_internal(path.clone(), "First Signature".to_string());
    assert!(result1.is_ok());
    
    // Second signature (this should work on the already signed document)
    let result2 = sign_pdf_internal(path.clone(), "Second Signature".to_string());
    assert!(result2.is_ok());
    
    // Verify page count is still correct
    let final_count = get_page_count_internal(path);
    assert!(final_count.is_ok());
    assert_eq!(final_count.unwrap(), 2);
}
