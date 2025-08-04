use rust_core::{get_page_count_internal, sign_pdf_internal, get_pdf_info_before_signing_internal};
use std::path::{Path, PathBuf};
use std::fs;

// Helper function to get test PDF files from sample-pdfs directory
fn get_sample_pdf_path(filename: &str) -> PathBuf {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("../sample-pdfs");
    path.push(filename);
    path
}

// Helper function to get all sample PDF files
fn get_all_sample_pdfs() -> Vec<PathBuf> {
    let sample_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../sample-pdfs");
    let mut pdfs = Vec::new();
    
    if let Ok(entries) = fs::read_dir(sample_dir) {
        for entry in entries.flatten() {
            if let Some(ext) = entry.path().extension() {
                if ext == "pdf" {
                    pdfs.push(entry.path());
                }
            }
        }
    }
    
    pdfs
}

#[test]
fn test_page_count_with_sample_pdfs() {
    let sample_pdfs = get_all_sample_pdfs();
    assert!(!sample_pdfs.is_empty(), "No sample PDF files found");
    
    for pdf_path in sample_pdfs {
        if pdf_path.exists() {
            let path_str = pdf_path.to_string_lossy().to_string();
            let result = get_page_count_internal(path_str);
            
            // Should successfully get page count for all sample PDFs
            assert!(result.is_ok(), "Failed to get page count for {:?}", pdf_path);
            let count = result.unwrap();
            
            // Page count should be reasonable (0-10000 pages)
            assert!(count <= 10000, "Unreasonable page count {} for {:?}", count, pdf_path);
            
            println!("PDF: {:?} has {} pages", pdf_path.file_name().unwrap(), count);
        }
    }
}

#[test]
fn test_specific_sample_pdfs() {
    // Test with specific known PDFs if they exist
    let test_cases = vec![
        ("example.pdf", None), // We don't know exact page count, just test it works
        ("sample-local-pdf.pdf", None),
        ("dictionary.pdf", None),
    ];
    
    for (filename, expected_pages) in test_cases {
        let pdf_path = get_sample_pdf_path(filename);
        if pdf_path.exists() {
            let path_str = pdf_path.to_string_lossy().to_string();
            let result = get_page_count_internal(path_str);
            
            assert!(result.is_ok(), "Failed to get page count for {}", filename);
            let count = result.unwrap();
            
            if let Some(expected) = expected_pages {
                assert_eq!(count, expected, "Page count mismatch for {}", filename);
            }
            
            println!("Sample PDF {} has {} pages", filename, count);
        } else {
            println!("Sample PDF {} not found, skipping test", filename);
        }
    }
}

#[test]
fn test_pdf_info_before_signing_with_samples() {
    let sample_pdfs = get_all_sample_pdfs();
    
    for pdf_path in sample_pdfs.iter().take(3) { // Test with first 3 PDFs
        if pdf_path.exists() {
            let path_str = pdf_path.to_string_lossy().to_string();
            let info_result = get_pdf_info_before_signing_internal(path_str.clone());
            let count_result = get_page_count_internal(path_str);
            
            assert!(info_result.is_ok(), "Failed to get PDF info for {:?}", pdf_path);
            assert!(count_result.is_ok(), "Failed to get page count for {:?}", pdf_path);
            
            // Info result should match page count result
            assert_eq!(info_result.unwrap(), count_result.unwrap(), 
                      "PDF info and page count mismatch for {:?}", pdf_path);
        }
    }
}

#[test]
fn test_sign_pdf_with_sample() {
    // Create a copy of a sample PDF to test signing
    let sample_pdfs = get_all_sample_pdfs();
    if let Some(source_pdf) = sample_pdfs.first() {
        if source_pdf.exists() {
            // Create a temporary copy for signing
            let temp_dir = tempfile::tempdir().unwrap();
            let test_pdf = temp_dir.path().join("test_signing.pdf");
            fs::copy(source_pdf, &test_pdf).unwrap();
            
            let path_str = test_pdf.to_string_lossy().to_string();
            
            // Get original page count
            let original_count = get_page_count_internal(path_str.clone()).unwrap();
            
            // Sign the PDF
            let signature_text = "Integration Test Signature";
            let sign_result = sign_pdf_internal(path_str.clone(), signature_text.to_string());
            assert!(sign_result.is_ok(), "Failed to sign PDF");
            
            // Verify page count remains the same after signing
            let new_count = get_page_count_internal(path_str).unwrap();
            assert_eq!(original_count, new_count, "Page count changed after signing");
            
            println!("Successfully signed PDF with {} pages", new_count);
        }
    }
}

#[test]
fn test_error_handling_with_invalid_files() {
    // Test with non-existent file
    let result = get_page_count_internal("/nonexistent/file.pdf".to_string());
    assert!(result.is_err());
    
    // Test with directory instead of file (if sample-pdfs exists)
    let sample_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../sample-pdfs");
    if sample_dir.exists() {
        let result = get_page_count_internal(sample_dir.to_string_lossy().to_string());
        assert!(result.is_err());
    }
}

#[test]
fn test_performance_with_large_sample() {
    use std::time::Instant;
    
    let sample_pdfs = get_all_sample_pdfs();
    
    for pdf_path in sample_pdfs {
        if pdf_path.exists() {
            let start = Instant::now();
            let path_str = pdf_path.to_string_lossy().to_string();
            let result = get_page_count_internal(path_str);
            let duration = start.elapsed();
            
            assert!(result.is_ok(), "Failed to process {:?}", pdf_path);
            
            // Performance check: should complete within reasonable time
            assert!(duration.as_secs() < 10, 
                   "Processing {:?} took too long: {:?}", pdf_path, duration);
            
            println!("Processed {:?} in {:?}", pdf_path.file_name().unwrap(), duration);
        }
    }
}
