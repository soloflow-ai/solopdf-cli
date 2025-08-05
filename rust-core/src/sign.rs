use lopdf;
use napi::bindgen_prelude::*;
use napi_derive::napi;

// Import the page count function from the page-count module
use crate::page_count::get_page_count;

#[derive(Debug)]
#[napi(object)]
pub struct SigningOptions {
    pub font_size: Option<f64>,
    pub color: Option<String>,
    pub x_position: Option<f64>,
    pub y_position: Option<f64>,
    pub pages: Option<Vec<u32>>,
    pub position: Option<String>, // "top-left", "top-right", "bottom-left", "bottom-right", "center"
    pub rotation: Option<f64>,
    pub opacity: Option<f64>,
}

/// Gets page count information for a PDF before signing
pub fn get_pdf_info_before_signing(file_path: String) -> Result<u32> {
    get_page_count(file_path)
}

/// Adds a basic, non-cryptographic signature field to a PDF document.
///
/// # Warning
/// This function creates a signature field in the PDF structure but does NOT
/// create a legally-binding or verifiable digital signature. It simply embeds
/// the provided text in a signature container. For real digital signatures,
/// a library with cryptographic capabilities is required.
///
/// # Arguments
/// * `file_path` - The path to the PDF file to be signed.
/// * `signature_text` - The text string to embed in the signature field.
///
/// # Returns
/// A `Result<()>` which is `Ok(())` on success or an `napi::Error` on failure.
pub fn sign_pdf_with_visible_text(file_path: String, signature_text: String) -> Result<()> {
    // Load the PDF document, propagating any errors.
    let mut document = lopdf::Document::load(&file_path).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to load PDF: {e}"),
        )
    })?;

    // Get the first page to add visible text
    let pages = document.get_pages();
    if pages.is_empty() {
        return Err(napi::Error::new(
            napi::Status::GenericFailure,
            "PDF has no pages".to_string(),
        ));
    }

    let (first_page_id, _) = pages.iter().next().unwrap();

    // Create a text object for the signature
    let text_object = lopdf::content::Content {
        operations: vec![
            // Set text position (bottom-right corner, approximately)
            lopdf::content::Operation::new("BT", vec![]), // Begin text
            lopdf::content::Operation::new(
                "Tf",
                vec![
                    lopdf::Object::Name(b"Helvetica".to_vec()),
                    lopdf::Object::Real(12.0),
                ],
            ), // Set font
            lopdf::content::Operation::new(
                "Td",
                vec![
                    lopdf::Object::Real(400.0), // X position
                    lopdf::Object::Real(50.0),  // Y position
                ],
            ), // Set text position
            lopdf::content::Operation::new(
                "Tj",
                vec![lopdf::Object::String(
                    signature_text.clone().into_bytes(),
                    lopdf::StringFormat::Literal,
                )],
            ), // Show text
            lopdf::content::Operation::new("ET", vec![]), // End text
        ],
    };

    // Convert content to bytes
    let content_data = text_object.encode().map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to encode content: {e}"),
        )
    })?;

    // Create a content stream object
    let content_stream =
        lopdf::Object::Stream(lopdf::Stream::new(lopdf::Dictionary::new(), content_data));
    let content_id = document.add_object(content_stream);

    // Get the page object and add the content stream
    // Convert u32 to ObjectId (u32, u16) with generation 0
    let page_object_id = (*first_page_id, 0);
    if let Ok(lopdf::Object::Dictionary(page_dict)) = document.get_object_mut(page_object_id) {
        // Add the content stream to the page's Contents array
        match page_dict.get_mut(b"Contents") {
            Ok(lopdf::Object::Array(contents)) => {
                contents.push(lopdf::Object::Reference(content_id));
            }
            Ok(lopdf::Object::Reference(_)) => {
                // If Contents is a single reference, convert it to an array
                let old_contents = page_dict.get(b"Contents").unwrap().clone();
                page_dict.set(
                    "Contents",
                    lopdf::Object::Array(vec![old_contents, lopdf::Object::Reference(content_id)]),
                );
            }
            _ => {
                // If no Contents, create a new array
                page_dict.set(
                    "Contents",
                    lopdf::Object::Array(vec![lopdf::Object::Reference(content_id)]),
                );
            }
        }
    }

    // Also add the traditional signature field for completeness
    let mut signature_dict = lopdf::Dictionary::new();
    signature_dict.set("Type", lopdf::Object::Name(b"Sig".to_vec()));
    signature_dict.set("Filter", lopdf::Object::Name(b"Adobe.PPKLite".to_vec()));
    signature_dict.set(
        "SubFilter",
        lopdf::Object::Name(b"adbe.pkcs7.detached".to_vec()),
    );
    signature_dict.set(
        "Contents",
        lopdf::Object::String(
            signature_text.clone().into_bytes(),
            lopdf::StringFormat::Hexadecimal,
        ),
    );

    let signature_id = document.add_object(signature_dict);

    // Create the form field that will represent the signature in the document.
    let mut fields = lopdf::Dictionary::new();
    fields.set("FT", lopdf::Object::Name(b"Sig".to_vec()));
    fields.set(
        "T",
        lopdf::Object::String(b"VisibleSignature1".to_vec(), lopdf::StringFormat::Literal),
    );
    fields.set("V", lopdf::Object::Reference(signature_id));
    fields.set("Ff", lopdf::Object::Integer(132));

    let field_id = document.add_object(fields);

    // Create AcroForm dictionary
    let mut acroform = lopdf::Dictionary::new();
    acroform.set(
        "Fields",
        lopdf::Object::Array(vec![lopdf::Object::Reference(field_id)]),
    );
    let acroform_id = document.add_object(acroform);

    // Add AcroForm to the catalog
    if let Ok(lopdf::Object::Dictionary(catalog_dict)) = document.get_object_mut((1, 0)) {
        catalog_dict.set("AcroForm", lopdf::Object::Reference(acroform_id));
    }

    // Save the modified document back to the original file path.
    document.save(&file_path).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to save PDF: {e}"),
        )
    })?;

    Ok(())
}

/// Advanced signing function that accepts options for customization
pub fn sign_pdf_with_options(
    file_path: String,
    signature_text: String,
    options: Option<SigningOptions>,
) -> Result<()> {
    let opts = options.unwrap_or(SigningOptions {
        font_size: Some(12.0),
        color: Some("black".to_string()),
        x_position: Some(400.0),
        y_position: Some(50.0),
        pages: None,
        position: Some("bottom-right".to_string()),
        rotation: Some(0.0),
        opacity: Some(1.0),
    });

    // Load the PDF document
    let mut document = lopdf::Document::load(&file_path).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to load PDF: {e}"),
        )
    })?;

    // Get pages to sign
    let pages = document.get_pages();
    if pages.is_empty() {
        return Err(napi::Error::new(
            napi::Status::GenericFailure,
            "PDF has no pages".to_string(),
        ));
    }

    // Determine which pages to sign
    let target_pages: Vec<_> = if let Some(page_nums) = &opts.pages {
        pages
            .iter()
            .enumerate()
            .filter_map(|(i, (page_id, _))| {
                if page_nums.contains(&((i + 1) as u32)) {
                    Some(*page_id)
                } else {
                    None
                }
            })
            .collect()
    } else {
        pages.keys().copied().collect()
    };

    // Get positioning values
    let font_size = opts.font_size.unwrap_or(12.0);
    let (x_pos, y_pos) = match opts.position.as_deref() {
        Some("top-left") => (50.0, 750.0),
        Some("top-right") => (450.0, 750.0),
        Some("bottom-left") => (50.0, 50.0),
        Some("center") => (300.0, 400.0),
        _ => (
            opts.x_position.unwrap_or(400.0),
            opts.y_position.unwrap_or(50.0),
        ), // default bottom-right
    };

    // Sign each target page
    for page_id in target_pages {
        // Create text content for this page
        let text_object = lopdf::content::Content {
            operations: vec![
                lopdf::content::Operation::new("BT", vec![]),
                lopdf::content::Operation::new(
                    "Tf",
                    vec![
                        lopdf::Object::Name(b"Helvetica".to_vec()),
                        lopdf::Object::Real(font_size as f32),
                    ],
                ),
                lopdf::content::Operation::new(
                    "Td",
                    vec![
                        lopdf::Object::Real(x_pos as f32),
                        lopdf::Object::Real(y_pos as f32),
                    ],
                ),
                lopdf::content::Operation::new(
                    "Tj",
                    vec![lopdf::Object::String(
                        signature_text.clone().into_bytes(),
                        lopdf::StringFormat::Literal,
                    )],
                ),
                lopdf::content::Operation::new("ET", vec![]),
            ],
        };

        // Add content to page
        let content_data = text_object.encode().map_err(|e| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("Failed to encode content: {e}"),
            )
        })?;

        let content_stream =
            lopdf::Object::Stream(lopdf::Stream::new(lopdf::Dictionary::new(), content_data));
        let content_id = document.add_object(content_stream);

        // Add to page contents
        let page_object_id = (page_id, 0);
        if let Ok(lopdf::Object::Dictionary(page_dict)) = document.get_object_mut(page_object_id) {
            match page_dict.get_mut(b"Contents") {
                Ok(lopdf::Object::Array(contents)) => {
                    contents.push(lopdf::Object::Reference(content_id));
                }
                Ok(lopdf::Object::Reference(_)) => {
                    let old_contents = page_dict.get(b"Contents").unwrap().clone();
                    page_dict.set(
                        "Contents",
                        lopdf::Object::Array(vec![
                            old_contents,
                            lopdf::Object::Reference(content_id),
                        ]),
                    );
                }
                _ => {
                    page_dict.set(
                        "Contents",
                        lopdf::Object::Array(vec![lopdf::Object::Reference(content_id)]),
                    );
                }
            }
        }
    }

    // Add signature field to document
    let mut signature_dict = lopdf::Dictionary::new();
    signature_dict.set("Type", lopdf::Object::Name(b"Sig".to_vec()));
    signature_dict.set("Filter", lopdf::Object::Name(b"Adobe.PPKLite".to_vec()));
    signature_dict.set(
        "SubFilter",
        lopdf::Object::Name(b"adbe.pkcs7.detached".to_vec()),
    );
    signature_dict.set(
        "Contents",
        lopdf::Object::String(
            signature_text.clone().into_bytes(),
            lopdf::StringFormat::Hexadecimal,
        ),
    );

    let signature_id = document.add_object(signature_dict);

    // Create form field
    let mut fields = lopdf::Dictionary::new();
    fields.set("FT", lopdf::Object::Name(b"Sig".to_vec()));
    fields.set(
        "T",
        lopdf::Object::String(b"AdvancedSignature1".to_vec(), lopdf::StringFormat::Literal),
    );
    fields.set("V", lopdf::Object::Reference(signature_id));
    fields.set("Ff", lopdf::Object::Integer(132));

    let field_id = document.add_object(fields);

    // Create AcroForm dictionary
    let mut acroform = lopdf::Dictionary::new();
    acroform.set(
        "Fields",
        lopdf::Object::Array(vec![lopdf::Object::Reference(field_id)]),
    );
    let acroform_id = document.add_object(acroform);

    // Add AcroForm to catalog
    if let Ok(lopdf::Object::Dictionary(catalog_dict)) = document.get_object_mut((1, 0)) {
        catalog_dict.set("AcroForm", lopdf::Object::Reference(acroform_id));
    }

    // Save document
    document.save(&file_path).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to save PDF: {e}"),
        )
    })?;

    Ok(())
}

/// Adds a basic, non-cryptographic signature field to a PDF document (legacy version).
pub fn sign_pdf_legacy(file_path: String, signature_text: String) -> Result<()> {
    // Load the PDF document, propagating any errors.
    let mut document = lopdf::Document::load(&file_path).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to load PDF: {e}"),
        )
    })?;

    // Create a signature dictionary. This defines the appearance and type of signature.
    let mut signature_dict = lopdf::Dictionary::new();
    signature_dict.set("Type", lopdf::Object::Name(b"Sig".to_vec()));
    signature_dict.set("Filter", lopdf::Object::Name(b"Adobe.PPKLite".to_vec()));
    signature_dict.set(
        "SubFilter",
        lopdf::Object::Name(b"adbe.pkcs7.detached".to_vec()),
    );

    // The "Contents" field should contain a hex-encoded PKCS#7 signature.
    // Here, we are just embedding the raw signature text as a placeholder.
    // A real implementation would require a much more complex, binary object.
    signature_dict.set(
        "Contents",
        lopdf::Object::String(
            signature_text.into_bytes(),
            lopdf::StringFormat::Hexadecimal,
        ),
    );

    // Add the signature dictionary as a new object in the PDF.
    let signature_id = document.add_object(signature_dict);

    // Create the form field that will represent the signature in the document.
    let mut fields = lopdf::Dictionary::new();
    fields.set("FT", lopdf::Object::Name(b"Sig".to_vec())); // Field Type: Signature
    fields.set(
        "T",
        lopdf::Object::String(b"Signature1".to_vec(), lopdf::StringFormat::Literal),
    ); // Field Name
    fields.set("V", lopdf::Object::Reference(signature_id)); // The value is a reference to our signature object.
    fields.set("Ff", lopdf::Object::Integer(132)); // Field flags: read-only, required, etc.

    // Add the form field to the document
    let field_id = document.add_object(fields);

    // Create AcroForm dictionary
    let mut acroform = lopdf::Dictionary::new();
    acroform.set(
        "Fields",
        lopdf::Object::Array(vec![lopdf::Object::Reference(field_id)]),
    );
    let acroform_id = document.add_object(acroform);

    // Add AcroForm to the catalog
    if let Ok(lopdf::Object::Dictionary(catalog_dict)) = document.get_object_mut((1, 0)) {
        catalog_dict.set("AcroForm", lopdf::Object::Reference(acroform_id));
    }

    // Save the modified document back to the original file path.
    document.save(&file_path).map_err(|e| {
        napi::Error::new(
            napi::Status::GenericFailure,
            format!("Failed to save PDF: {e}"),
        )
    })?;

    Ok(())
}

// Internal versions for testing
pub fn get_pdf_info_before_signing_internal(
    file_path: String,
) -> std::result::Result<u32, Box<dyn std::error::Error>> {
    use crate::page_count::get_page_count_internal;
    get_page_count_internal(file_path)
}

pub fn sign_pdf_internal(
    file_path: String,
    signature_text: String,
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    // Load the PDF document
    let mut document = lopdf::Document::load(&file_path)?;

    // Create a signature dictionary
    let mut signature_dict = lopdf::Dictionary::new();
    signature_dict.set("Type", lopdf::Object::Name(b"Sig".to_vec()));
    signature_dict.set("Filter", lopdf::Object::Name(b"Adobe.PPKLite".to_vec()));
    signature_dict.set(
        "SubFilter",
        lopdf::Object::Name(b"adbe.pkcs7.detached".to_vec()),
    );
    signature_dict.set(
        "Contents",
        lopdf::Object::String(
            signature_text.into_bytes(),
            lopdf::StringFormat::Hexadecimal,
        ),
    );

    let signature_id = document.add_object(signature_dict);

    // Create the form field
    let mut fields = lopdf::Dictionary::new();
    fields.set("FT", lopdf::Object::Name(b"Sig".to_vec()));
    fields.set(
        "T",
        lopdf::Object::String(b"Signature1".to_vec(), lopdf::StringFormat::Literal),
    );
    fields.set("V", lopdf::Object::Reference(signature_id));
    fields.set("Ff", lopdf::Object::Integer(132));

    let field_id = document.add_object(fields);

    // Create AcroForm dictionary
    let mut acroform = lopdf::Dictionary::new();
    acroform.set(
        "Fields",
        lopdf::Object::Array(vec![lopdf::Object::Reference(field_id)]),
    );
    let acroform_id = document.add_object(acroform);

    // Add AcroForm to the catalog
    if let Ok(lopdf::Object::Dictionary(catalog_dict)) = document.get_object_mut((1, 0)) {
        catalog_dict.set("AcroForm", lopdf::Object::Reference(acroform_id));
    }

    // Save the modified document
    document.save(&file_path)?;
    Ok(())
}
