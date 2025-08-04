use lopdf::{Dictionary, Document, Object, Stream};
use std::env;
use std::fs;
use std::path::Path;

/// Creates a simple PDF document for testing purposes
fn create_test_pdf(
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

    // Set up the page parent references
    for page_ref in page_refs {
        if let Object::Reference(page_id) = page_ref {
            if let Ok(Object::Dictionary(ref mut page_dict)) = doc.get_object_mut(page_id) {
                page_dict.set("Parent", Object::Reference(pages_id));
            }
        }
    }

    catalog.set("Pages", Object::Reference(pages_id));
    let catalog_id = doc.add_object(catalog);
    doc.trailer.set("Root", Object::Reference(catalog_id));

    Ok(doc)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();

    if args.len() != 2 {
        eprintln!("Usage: {} <output_directory>", args[0]);
        std::process::exit(1);
    }

    let output_dir = &args[1];

    // Create output directory if it doesn't exist
    fs::create_dir_all(output_dir)?;

    println!("Generating test PDFs in directory: {output_dir}");

    // Generate various test PDFs
    let test_cases = vec![
        (1, "single-page", "This is a single page test document with simple content."),
        (3, "three-pages", "This is a three-page test document with multiple pages."),
        (10, "ten-pages", "This is a ten-page test document for performance testing."),
        (1, "special-chars", "Test with special characters: àáâãäåæçèéêë ñòóôõö ùúûüý ÿ €£¥"),
        (1, "long-content", "This is a test document with very long content that should span multiple lines and test the text wrapping capabilities of the PDF rendering system. This content is intentionally verbose to test various aspects of PDF processing."),
        (1, "minimal-empty", ""),
        (1, "empty-content", " "),
    ];

    for (page_count, name, content) in test_cases {
        let file_path = Path::new(output_dir).join(format!("{name}.pdf"));

        println!(
            "Creating {} with {} page(s)...",
            file_path.display(),
            page_count
        );

        let mut doc = create_test_pdf(page_count, name, content)?;
        doc.save(&file_path)?;

        println!("✅ Created: {}", file_path.display());
    }

    // Create a test info file
    let info_file = Path::new(output_dir).join("test-info.json");
    let info_content = r#"{
  "generated_by": "generate_test_pdfs",
  "timestamp": "2025-08-04",
  "test_files": [
    {"name": "single-page.pdf", "pages": 1, "description": "Single page test document"},
    {"name": "three-pages.pdf", "pages": 3, "description": "Three page test document"},
    {"name": "ten-pages.pdf", "pages": 10, "description": "Ten page test document"},
    {"name": "special-chars.pdf", "pages": 1, "description": "Document with special characters"},
    {"name": "long-content.pdf", "pages": 1, "description": "Document with long content"},
    {"name": "minimal-empty.pdf", "pages": 1, "description": "Document with minimal content"},
    {"name": "empty-content.pdf", "pages": 1, "description": "Document with empty content"}
  ]
}"#;

    fs::write(&info_file, info_content)?;
    println!("✅ Created test info file: {}", info_file.display());

    println!("\n🎉 All test PDFs generated successfully!");

    Ok(())
}
