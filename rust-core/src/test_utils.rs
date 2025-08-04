use lopdf::{Dictionary, Document, Object, Stream};

/// Creates a simple PDF document for testing purposes
pub fn create_test_pdf(
    page_count: u32,
    title: &str,
    content: &str,
) -> Result<Document, Box<dyn std::error::Error>> {
    let mut doc = Document::new();

    // Create the catalog (root object)
    let mut catalog = Dictionary::new();
    catalog.set("Type", Object::Name(b"Catalog".to_vec()));

    // Create the pages object
    let mut pages = Dictionary::new();
    pages.set("Type", Object::Name(b"Pages".to_vec()));
    pages.set("Count", Object::Integer(page_count as i64));

    let mut page_refs = Vec::new();

    // Create individual pages
    for i in 0..page_count {
        let mut page = Dictionary::new();
        page.set("Type", Object::Name(b"Page".to_vec()));
        page.set(
            "MediaBox",
            Object::Array(vec![
                Object::Integer(0),
                Object::Integer(0),
                Object::Integer(612), // Letter size width
                Object::Integer(792), // Letter size height
            ]),
        );

        // Create page content
        let page_content = format!(
            "BT\n/F1 12 Tf\n50 750 Td\n({} - Page {})\nTj\n50 730 Td\n({})\nTj\nET",
            title,
            i + 1,
            content
        );

        let content_stream = Stream::new(Dictionary::new(), page_content.into_bytes());
        let content_id = doc.add_object(content_stream);
        page.set("Contents", Object::Reference(content_id));

        // Create font resource
        let mut font = Dictionary::new();
        font.set("Type", Object::Name(b"Font".to_vec()));
        font.set("Subtype", Object::Name(b"Type1".to_vec()));
        font.set("BaseFont", Object::Name(b"Helvetica".to_vec()));
        let font_id = doc.add_object(font);

        let mut fonts = Dictionary::new();
        fonts.set("F1", Object::Reference(font_id));

        let mut resources = Dictionary::new();
        resources.set("Font", Object::Dictionary(fonts));
        page.set("Resources", Object::Dictionary(resources));

        let page_id = doc.add_object(page);
        page_refs.push(Object::Reference(page_id));
    }

    pages.set("Kids", Object::Array(page_refs.clone()));
    let pages_id = doc.add_object(pages);

    // Set parent reference for each page
    for page_ref in page_refs {
        if let Object::Reference(id) = page_ref {
            if let Ok(Object::Dictionary(page_dict)) = doc.get_object_mut(id) {
                page_dict.set("Parent", Object::Reference(pages_id));
            }
        }
    }

    catalog.set("Pages", Object::Reference(pages_id));
    let catalog_id = doc.add_object(catalog);

    // Set the catalog as the root
    doc.trailer.set("Root", Object::Reference(catalog_id));

    Ok(doc)
}

/// Saves a PDF document to the specified path
pub fn save_test_pdf(doc: &mut Document, path: &str) -> Result<(), Box<dyn std::error::Error>> {
    doc.save(path)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;

    #[test]
    fn test_create_simple_pdf() {
        let doc = create_test_pdf(1, "Test PDF", "This is a test document").unwrap();
        assert_eq!(doc.get_pages().len(), 1);
    }

    #[test]
    fn test_create_multi_page_pdf() {
        let doc = create_test_pdf(5, "Multi-page Test", "Page content").unwrap();
        assert_eq!(doc.get_pages().len(), 5);
    }

    #[test]
    fn test_save_pdf() {
        let mut doc = create_test_pdf(1, "Save Test", "Content").unwrap();
        let temp_file = NamedTempFile::new().unwrap();
        let path = temp_file.path().to_str().unwrap();

        assert!(save_test_pdf(&mut doc, path).is_ok());

        // Verify we can load it back
        let loaded_doc = Document::load(path).unwrap();
        assert_eq!(loaded_doc.get_pages().len(), 1);
    }
}
