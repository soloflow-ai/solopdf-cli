use rust_core::page_count::get_page_count_internal;
use tempfile::NamedTempFile;
use std::fs;
use lopdf::{Document, Object, Stream, dictionary};

// Test utility functions
fn create_test_pdf(page_count: usize, _title: &str, content: &str) -> Result<Document, Box<dyn std::error::Error>> {
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
fn test_get_page_count_single_page() {
    let mut doc = create_test_pdf(1, "Single Page Test", "Test content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = get_page_count_internal(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 1);
}

#[test]
fn test_get_page_count_multiple_pages() {
    let mut doc = create_test_pdf(5, "Multi Page Test", "Test content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = get_page_count_internal(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 5);
}

#[test]
fn test_get_page_count_empty_document() {
    let mut doc = create_test_pdf(0, "Empty Test", "").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = get_page_count_internal(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 0);
}

#[test]
fn test_get_page_count_nonexistent_file() {
    let result = get_page_count_internal("/nonexistent/file.pdf".to_string());
    assert!(result.is_err());
}

#[test]
fn test_get_page_count_invalid_file() {
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    // Write invalid PDF content
    fs::write(&path, b"This is not a PDF file").unwrap();
    
    let result = get_page_count_internal(path);
    assert!(result.is_err());
}

#[test]
fn test_get_page_count_large_document() {
    let mut doc = create_test_pdf(100, "Large Document Test", "Lots of content").unwrap();
    let temp_file = NamedTempFile::new().unwrap();
    let path = temp_file.path().to_str().unwrap().to_string();
    
    save_test_pdf(&mut doc, &path).unwrap();
    
    let result = get_page_count_internal(path);
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), 100);
}

#[test]
fn test_get_page_count_edge_cases() {
    // Test with various edge cases
    let test_cases = vec![
        (1, "Edge Case 1", ""),
        (2, "", "No title"),
        (3, "Special chars: éñü", "Content with émojis 📄✨"),
        (1, "Very long title ".repeat(10).as_str(), "Short content"),
    ];
    
    for (pages, title, content) in test_cases {
        let mut doc = create_test_pdf(pages, title, content).unwrap();
        let temp_file = NamedTempFile::new().unwrap();
        let path = temp_file.path().to_str().unwrap().to_string();
        
        save_test_pdf(&mut doc, &path).unwrap();
        
        let result = get_page_count_internal(path);
        assert!(result.is_ok(), "Failed for title: {}", title);
        assert_eq!(result.unwrap(), pages, "Page count mismatch for title: {}", title);
    }
}
