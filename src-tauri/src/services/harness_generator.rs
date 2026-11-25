use base64::Engine as _;
use serde_json::Value;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::java::{TestCaseResultDto, TestCaseSpec};

const MAX_SOURCE_BYTES: usize = 128 * 1024;

#[derive(Debug, Clone)]
pub struct GeneratedHarness {
    pub sanitized_solution_source: String,
    pub runner_source: String,
    pub nonce: String,
}

/// Strip top-level `package ...;` statements while preserving original line numbers
/// so `javac` error line numbers align directly with the CodeMirror editor.
pub fn sanitize_user_solution(source_code: &str) -> Result<String, AppError> {
    if source_code.trim().is_empty() {
        return Err(AppError::ValidationError(
            "Source code cannot be empty.".to_string(),
        ));
    }
    if source_code.len() > MAX_SOURCE_BYTES {
        return Err(AppError::ValidationError(format!(
            "Source code exceeds the maximum allowed size ({MAX_SOURCE_BYTES} bytes)."
        )));
    }
    if !contains_solution_class(source_code) {
        return Err(AppError::ValidationError(
            "Your code must define `public class Solution` (or `class Solution`).".to_string(),
        ));
    }

    let mut out_lines = Vec::new();
    let mut in_package_stmt = false;

    for line in source_code.lines() {
        let trimmed = line.trim_start();
        if !in_package_stmt && is_package_statement_start(trimmed) {
            out_lines.push("// [AlgoJava] package declaration omitted for local test execution");
            if !trimmed.contains(';') {
                in_package_stmt = true;
            }
        } else if in_package_stmt {
            out_lines.push("// [AlgoJava] package declaration continuation omitted");
            if trimmed.contains(';') {
                in_package_stmt = false;
            }
        } else {
            out_lines.push(line);
        }
    }

    let mut result = out_lines.join("\n");
    if source_code.ends_with('\n') {
        result.push('\n');
    }
    Ok(result)
}

fn is_package_statement_start(trimmed_line: &str) -> bool {
    if let Some(rest) = trimmed_line.strip_prefix("package") {
        return rest.starts_with(|c: char| c.is_whitespace());
    }
    false
}

fn contains_solution_class(source: &str) -> bool {
    let bytes = source.as_bytes();
    let needle = b"class";
    let mut idx = 0;

    while let Some(pos) = source[idx..].find("class") {
        let abs = idx + pos;
        let before_ok = abs == 0 || !(bytes[abs - 1].is_ascii_alphanumeric() || bytes[abs - 1] == b'_');
        let after_idx = abs + needle.len();
        let after_ok = after_idx < bytes.len() && bytes[after_idx].is_ascii_whitespace();
        if before_ok && after_ok {
            let rest = source[after_idx..].trim_start();
            if let Some(after_name) = rest.strip_prefix("Solution") {
                if after_name.is_empty()
                    || !after_name
                        .chars()
                        .next()
                        .map(|c| c.is_ascii_alphanumeric() || c == '_')
                        .unwrap_or(false)
                {
                    return true;
                }
            }
        }
        idx = after_idx;
    }

    false
}

fn validate_java_identifier(name: &str) -> Result<(), AppError> {
    let mut chars = name.chars();
    let first = chars
        .next()
        .ok_or_else(|| AppError::ValidationError("Method name cannot be empty.".to_string()))?;
    if !(first.is_ascii_alphabetic() || first == '_') {
        return Err(AppError::ValidationError(format!(
            "Invalid Java method name: {name}"
        )));
    }
    if !chars.all(|c| c.is_ascii_alphanumeric() || c == '_') {
        return Err(AppError::ValidationError(format!(
            "Invalid Java method name: {name}"
        )));
    }
    Ok(())
}

fn escape_java_string(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for ch in s.chars() {
        match ch {
            '\\' => out.push_str("\\\\"),
            '"' => out.push_str("\\\""),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                out.push_str(&format!("\\u{:04x}", c as u32));
            }
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

fn json_value_to_java_literal(val: &Value, param_type: &str) -> Result<String, AppError> {
    match param_type {
        "int" => {
            let n = val.as_i64().ok_or_else(|| {
                AppError::ValidationError(format!("Expected integer test argument, got {val}"))
            })?;
            let n32 = i32::try_from(n).map_err(|_| {
                AppError::ValidationError(format!("Integer test argument out of 32-bit range: {n}"))
            })?;
            Ok(n32.to_string())
        }
        "long" => {
            let n = val.as_i64().ok_or_else(|| {
                AppError::ValidationError(format!("Expected long test argument, got {val}"))
            })?;
            Ok(format!("{n}L"))
        }
        "double" => {
            let n = val.as_f64().ok_or_else(|| {
                AppError::ValidationError(format!("Expected double test argument, got {val}"))
            })?;
            Ok(format!("{n:?}d"))
        }
        "boolean" => {
            let b = val.as_bool().ok_or_else(|| {
                AppError::ValidationError(format!("Expected boolean test argument, got {val}"))
            })?;
            Ok(if b { "true".into() } else { "false".into() })
        }
        "String" => {
            if val.is_null() {
                Ok("null".into())
            } else {
                let s = val.as_str().ok_or_else(|| {
                    AppError::ValidationError(format!("Expected string test argument, got {val}"))
                })?;
                Ok(escape_java_string(s))
            }
        }
        "int[]" => {
            if val.is_null() {
                return Ok("null".into());
            }
            let arr = val.as_array().ok_or_else(|| {
                AppError::ValidationError(format!("Expected int[] test argument, got {val}"))
            })?;
            let mut items = Vec::with_capacity(arr.len());
            for item in arr {
                items.push(json_value_to_java_literal(item, "int")?);
            }
            Ok(format!("new int[]{{{}}}", items.join(", ")))
        }
        "String[]" => {
            if val.is_null() {
                return Ok("null".into());
            }
            let arr = val.as_array().ok_or_else(|| {
                AppError::ValidationError(format!("Expected String[] test argument, got {val}"))
            })?;
            let mut items = Vec::with_capacity(arr.len());
            for item in arr {
                items.push(json_value_to_java_literal(item, "String")?);
            }
            Ok(format!("new String[]{{{}}}", items.join(", ")))
        }
        other => Err(AppError::ValidationError(format!(
            "Unsupported Java parameter type: {other}"
        ))),
    }
}

fn expected_string_to_java_literal(expected: &str, return_type: &str) -> Result<String, AppError> {
    let trimmed = expected.trim();
    match return_type {
        "int" => {
            let n: i32 = trimmed.parse().map_err(|_| {
                AppError::ValidationError(format!("Invalid expected int output: {expected}"))
            })?;
            Ok(n.to_string())
        }
        "long" => {
            let n: i64 = trimmed.parse().map_err(|_| {
                AppError::ValidationError(format!("Invalid expected long output: {expected}"))
            })?;
            Ok(format!("{n}L"))
        }
        "double" => {
            let n: f64 = trimmed.parse().map_err(|_| {
                AppError::ValidationError(format!("Invalid expected double output: {expected}"))
            })?;
            Ok(format!("{n:?}d"))
        }
        "boolean" => match trimmed {
            "true" => Ok("true".into()),
            "false" => Ok("false".into()),
            _ => Err(AppError::ValidationError(format!(
                "Invalid expected boolean output: {expected}"
            ))),
        },
        "String" => Ok(escape_java_string(expected)),
        "int[]" => {
            let parsed: Value = serde_json::from_str(trimmed)?;
            json_value_to_java_literal(&parsed, "int[]")
        }
        "String[]" => {
            let parsed: Value = serde_json::from_str(trimmed)?;
            json_value_to_java_literal(&parsed, "String[]")
        }
        other => Err(AppError::ValidationError(format!(
            "Unsupported Java return type: {other}"
        ))),
    }
}

fn java_type_name(t: &str) -> Result<&'static str, AppError> {
    match t {
        "int" => Ok("int"),
        "long" => Ok("long"),
        "double" => Ok("double"),
        "boolean" => Ok("boolean"),
        "String" => Ok("String"),
        "int[]" => Ok("int[]"),
        "String[]" => Ok("String[]"),
        other => Err(AppError::ValidationError(format!(
            "Unsupported Java type: {other}"
        ))),
    }
}

fn equality_expr(return_type: &str, actual_var: &str, expected_var: &str) -> &'static str {
    match return_type {
        "int" | "long" | "boolean" => "actual == expected",
        "double" => "Math.abs(actual - expected) <= 1e-6",
        "String" => "Objects.equals(actual, expected)",
        "int[]" => "Arrays.equals(actual, expected)",
        "String[]" => "Arrays.equals(actual, expected)",
        _ => {
            let _ = (actual_var, expected_var);
            "false"
        }
    }
}

fn format_expr(return_type: &str) -> &'static str {
    match return_type {
        "int" | "long" | "double" | "boolean" => "String.valueOf(actual)",
        "String" => "actual == null ? \"null\" : actual",
        "int[]" => "Arrays.toString(actual)",
        "String[]" => "formatStringArray(actual)",
        _ => "String.valueOf(actual)",
    }
}

pub fn generate_java_harness(
    source_code: &str,
    method_name: &str,
    parameter_types: &[String],
    return_type: &str,
    test_cases: &[TestCaseSpec],
) -> Result<GeneratedHarness, AppError> {
    validate_java_identifier(method_name)?;
    let sanitized_solution_source = sanitize_user_solution(source_code)?;
    let java_ret_type = java_type_name(return_type)?;
    if test_cases.is_empty() {
        return Err(AppError::ValidationError(
            "At least one test case is required for execution.".to_string(),
        ));
    }

    let nonce = Uuid::new_v4().simple().to_string();
    let res_prefix = format!("__ALGOJAVA_RES_{nonce}__");
    let stdout_prefix = format!("__ALGOJAVA_STDOUT_{nonce}__");

    let mut runner = String::new();
    runner.push_str(
        "import java.io.ByteArrayOutputStream;\n\
         import java.io.PrintStream;\n\
         import java.nio.charset.StandardCharsets;\n\
         import java.util.Arrays;\n\
         import java.util.Base64;\n\
         import java.util.Objects;\n\n\
         public class AlgoJavaRunner {\n\
         \tprivate static String b64(String value) {\n\
         \t\tif (value == null) return \"\";\n\
         \t\treturn Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));\n\
         \t}\n\n\
         \tprivate static String formatStringArray(String[] arr) {\n\
         \t\tif (arr == null) return \"null\";\n\
         \t\tStringBuilder sb = new StringBuilder(\"[\");\n\
         \t\tfor (int i = 0; i < arr.length; i++) {\n\
         \t\t\tif (i > 0) sb.append(\", \");\n\
         \t\t\tif (arr[i] == null) {\n\
         \t\t\t\tsb.append(\"null\");\n\
         \t\t\t} else {\n\
         \t\t\t\tsb.append('\"').append(arr[i].replace(\"\\\\\", \"\\\\\\\\\").replace(\"\\\"\", \"\\\\\\\"\")).append('\"');\n\
         \t\t\t}\n\
         \t\t}\n\
         \t\tsb.append(\"]\");\n\
         \t\treturn sb.toString();\n\
         \t}\n\n\
         \tpublic static void main(String[] args) {\n\
         \t\tPrintStream realOut = System.out;\n\
         \t\tByteArrayOutputStream userOutBytes = new ByteArrayOutputStream();\n\
         \t\tPrintStream userOut = new PrintStream(userOutBytes, true, StandardCharsets.UTF_8);\n\
         \t\tSolution sol = new Solution();\n",
    );

    let eq_check = equality_expr(return_type, "actual", "expected");
    let fmt_actual = format_expr(return_type);

    for tc in test_cases {
        let parsed_args: Value = serde_json::from_str(&tc.input_args_json)?;
        let args_arr = parsed_args.as_array().ok_or_else(|| {
            AppError::ValidationError(format!(
                "Test case {} input_args_json must be a JSON array.",
                tc.case_number
            ))
        })?;
        if args_arr.len() != parameter_types.len() {
            return Err(AppError::ValidationError(format!(
                "Test case {} expects {} arguments, found {}.",
                tc.case_number,
                parameter_types.len(),
                args_arr.len()
            )));
        }

        let mut java_args = Vec::with_capacity(args_arr.len());
        for (idx, (val, param_type)) in args_arr.iter().zip(parameter_types.iter()).enumerate() {
            let ptype_java = java_type_name(param_type)?;
            let literal = json_value_to_java_literal(val, param_type)?;
            java_args.push((format!("arg_{}_{}", tc.case_number, idx), ptype_java, literal));
        }

        let expected_literal = expected_string_to_java_literal(&tc.expected_output, return_type)?;
        let call_args: Vec<&str> = java_args.iter().map(|(n, _, _)| n.as_str()).collect();

        runner.push_str("\t\t{\n");
        for (var_name, ptype_java, literal) in &java_args {
            runner.push_str(&format!("\t\t\t{ptype_java} {var_name} = {literal};\n"));
        }
        runner.push_str(&format!(
            "\t\t\t{java_ret_type} expected = {expected_literal};\n\
             \t\t\tboolean passed = false;\n\
             \t\t\tString actualEncoded = \"\";\n\
             \t\t\tString errEncoded = \"\";\n\
             \t\t\tlong elapsedMs = 0L;\n\
             \t\t\ttry {{\n\
             \t\t\t\tSystem.setOut(userOut);\n\
             \t\t\t\tlong startNs = System.nanoTime();\n\
             \t\t\t\t{java_ret_type} actual = sol.{method_name}({call_args});\n\
             \t\t\t\telapsedMs = Math.max(0L, (System.nanoTime() - startNs) / 1_000_000L);\n\
             \t\t\t\tSystem.setOut(realOut);\n\
             \t\t\t\tpassed = {eq_check};\n\
             \t\t\t\tactualEncoded = b64({fmt_actual});\n\
             \t\t\t}} catch (Throwable t) {{\n\
             \t\t\t\tSystem.setOut(realOut);\n\
             \t\t\t\tString msg = t.getClass().getSimpleName() + (t.getMessage() != null ? \": \" + t.getMessage() : \"\");\n\
             \t\t\t\terrEncoded = b64(msg);\n\
             \t\t\t}} finally {{\n\
             \t\t\t\tSystem.setOut(realOut);\n\
             \t\t\t}}\n\
             \t\t\trealOut.println(\"{res_prefix}|{case_num}|\" + (passed ? \"1\" : \"0\") + \"|\" + elapsedMs + \"|\" + actualEncoded + \"|\" + errEncoded);\n\
             \t\t}}\n",
            call_args = call_args.join(", "),
            case_num = tc.case_number,
        ));
    }

    runner.push_str(&format!(
        "\t\tuserOut.flush();\n\
         \t\tbyte[] captured = userOutBytes.toByteArray();\n\
         \t\tint limit = Math.min(captured.length, 65536);\n\
         \t\tString stdoutB64 = Base64.getEncoder().encodeToString(Arrays.copyOf(captured, limit));\n\
         \t\trealOut.println(\"{stdout_prefix}|\" + stdoutB64);\n\
         \t}}\n\
         }}\n"
    ));

    Ok(GeneratedHarness {
        sanitized_solution_source,
        runner_source: runner,
        nonce,
    })
}

fn decode_b64_utf8(raw: &str) -> String {
    if raw.is_empty() {
        return String::new();
    }
    base64::engine::general_purpose::STANDARD
        .decode(raw.trim())
        .map(|bytes| String::from_utf8_lossy(&bytes).into_owned())
        .unwrap_or_default()
}

pub fn parse_runner_stdout(
    raw_stdout: &str,
    nonce: &str,
    test_cases: &[TestCaseSpec],
) -> (String, Vec<TestCaseResultDto>) {
    let res_prefix = format!("__ALGOJAVA_RES_{nonce}__|");
    let stdout_prefix = format!("__ALGOJAVA_STDOUT_{nonce}__|");

    let mut results_by_case = std::collections::HashMap::new();
    let mut user_stdout = String::new();
    let mut extra_lines = Vec::new();

    for line in raw_stdout.lines() {
        if let Some(payload) = line.strip_prefix(&res_prefix) {
            let parts: Vec<&str> = payload.splitn(5, '|').collect();
            if parts.len() == 5 {
                if let Ok(case_num) = parts[0].parse::<i32>() {
                    let passed = parts[1] == "1";
                    let elapsed_ms = parts[2].parse::<u64>().unwrap_or(0);
                    let actual_str = decode_b64_utf8(parts[3]);
                    let error_str = decode_b64_utf8(parts[4]);

                    results_by_case.insert(
                        case_num,
                        (
                            passed,
                            elapsed_ms,
                            if actual_str.is_empty() && !error_str.is_empty() {
                                None
                            } else {
                                Some(actual_str)
                            },
                            if error_str.is_empty() {
                                None
                            } else {
                                Some(error_str)
                            },
                        ),
                    );
                }
            }
        } else if let Some(b64_stdout) = line.strip_prefix(&stdout_prefix) {
            user_stdout = decode_b64_utf8(b64_stdout);
        } else if !line.trim().is_empty() {
            extra_lines.push(line);
        }
    }

    if !extra_lines.is_empty() {
        if !user_stdout.is_empty() && !user_stdout.ends_with('\n') {
            user_stdout.push('\n');
        }
        user_stdout.push_str(&extra_lines.join("\n"));
    }

    let mut dtos = Vec::with_capacity(test_cases.len());
    for tc in test_cases {
        if let Some((passed, elapsed_ms, actual_output, error_message)) =
            results_by_case.remove(&tc.case_number)
        {
            dtos.push(TestCaseResultDto {
                test_case_id: tc.id,
                case_number: tc.case_number,
                display_input: tc.display_input.clone(),
                expected_output: tc.expected_output.clone(),
                actual_output,
                passed,
                error_message,
                execution_time_ms: elapsed_ms,
                is_hidden: tc.is_hidden,
            });
        } else {
            dtos.push(TestCaseResultDto {
                test_case_id: tc.id,
                case_number: tc.case_number,
                display_input: tc.display_input.clone(),
                expected_output: tc.expected_output.clone(),
                actual_output: None,
                passed: false,
                error_message: Some("Test case did not complete execution.".to_string()),
                execution_time_ms: 0,
                is_hidden: tc.is_hidden,
            });
        }
    }

    (user_stdout, dtos)
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::engine::general_purpose::STANDARD;

    #[test]
    fn sanitize_strips_package_preserving_line_numbers() {
        let src = "package com.algojava.test;\n\npublic class Solution {\n    public int sum(int a, int b) {\n        return a + b;\n    }\n}\n";
        let sanitized = sanitize_user_solution(src).expect("sanitize succeeds");
        assert_eq!(src.lines().count(), sanitized.lines().count());
        assert!(!sanitized.contains("package com.algojava"));
        assert!(sanitized.contains("public class Solution"));
    }

    #[test]
    fn sanitize_rejects_missing_solution_class() {
        let err = sanitize_user_solution("public class Main { }");
        assert!(matches!(err, Err(AppError::ValidationError(_))));
    }

    #[test]
    fn harness_escapes_strings_and_arrays_safely() {
        let test_cases = vec![TestCaseSpec {
            id: 1,
            case_number: 1,
            display_input: "\"hi\\n\"".to_string(),
            input_args_json: "[\"a\\\"b\\nc\"]".to_string(),
            expected_output: "a\"b\nc".to_string(),
            is_hidden: false,
        }];

        let harness = generate_java_harness(
            "public class Solution { public String echo(String s) { return s; } }",
            "echo",
            &["String".to_string()],
            "String",
            &test_cases,
        )
        .expect("generate harness");

        assert!(harness.runner_source.contains("sol.echo(arg_1_0)"));
        assert!(harness.runner_source.contains("\\\""));
        assert!(harness.runner_source.contains("\\n"));
    }

    #[test]
    fn parser_extracts_results_and_ignores_spoofed_user_stdout() {
        let test_cases = vec![TestCaseSpec {
            id: 10,
            case_number: 1,
            display_input: "(1, 2)".to_string(),
            input_args_json: "[1, 2]".to_string(),
            expected_output: "3".to_string(),
            is_hidden: false,
        }];

        let spoofed_user_stdout = STANDARD.encode("__ALGOJAVA_RES_wrong__");
        let actual_b64 = STANDARD.encode("3");
        let raw_stdout = format!(
            "__ALGOJAVA_RES_abc123__|1|1|4|{actual_b64}|\n__ALGOJAVA_STDOUT_abc123__|{spoofed_user_stdout}\n"
        );

        let (user_stdout, dtos) = parse_runner_stdout(&raw_stdout, "abc123", &test_cases);
        assert_eq!(user_stdout, "__ALGOJAVA_RES_wrong__");
        assert_eq!(dtos.len(), 1);
        assert!(dtos[0].passed);
        assert_eq!(dtos[0].actual_output.as_deref(), Some("3"));
    }
}
