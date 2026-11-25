PRAGMA foreign_keys = ON;

-- Seed categories
INSERT OR IGNORE INTO categories (id, name, description, icon, accent_color, is_featured, sort_order) VALUES ('warmup', 'Warmup', 'Beginner level problems', 'rocket', '#10b981', 1, 1);
INSERT OR IGNORE INTO categories (id, name, description, icon, accent_color, is_featured, sort_order) VALUES ('string', 'String', 'String manipulation', 'letter-t', '#3b82f6', 1, 2);
INSERT OR IGNORE INTO categories (id, name, description, icon, accent_color, is_featured, sort_order) VALUES ('array', 'Array', 'Array operations', 'cube', '#f97316', 1, 3);
INSERT OR IGNORE INTO categories (id, name, description, icon, accent_color, is_featured, sort_order) VALUES ('logic', 'Logic', 'Conditional logic', 'binary-tree', '#8b5cf6', 1, 4);
INSERT OR IGNORE INTO categories (id, name, description, icon, accent_color, is_featured, sort_order) VALUES ('ap', 'AP-1 / AP-2', 'Advanced problems', 'chart-bar', '#f59e0b', 1, 5);
INSERT OR IGNORE INTO categories (id, name, description, icon, accent_color, is_featured, sort_order) VALUES ('recursion', 'Recursion', 'Recursive problems', 'refresh', '#eab308', 1, 6);
INSERT OR IGNORE INTO categories (id, name, description, icon, accent_color, is_featured, sort_order) VALUES ('sorting', 'Sorting', 'Classic sorting algorithms', 'arrows-sort', '#a855f7', 0, 7);
INSERT OR IGNORE INTO categories (id, name, description, icon, accent_color, is_featured, sort_order) VALUES ('searching', 'Searching', 'Binary and linear search', 'search', '#06b6d4', 0, 8);
INSERT OR IGNORE INTO categories (id, name, description, icon, accent_color, is_featured, sort_order) VALUES ('advanced', 'Advanced', 'Dynamic programming and stacks', 'star', '#fbbf24', 0, 9);

-- Seed problems and test cases
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-01', 'sum-of-two-numbers', 'warmup', 'Sum of Two Numbers', 'Given two integers, return their sum.', 'Write a method that takes two integers as parameters and returns their sum.', 'Easy', 'sum', 'public int sum(int a, int b)', '["int","int"]', 'int', 'public class Solution {
    public int sum(int a, int b) {
        return 0;
    }
}
', 'public class Solution {
    public int sum(int a, int b) {
        return a + b;
    }
}
', 'Use the `+` operator to add the two integer parameters directly in O(1) time and O(1) space.', '[{"input":"1, 2","output":"3"},{"input":"5, 7","output":"12"}]', '["-10^9 <= a, b <= 10^9","Sum fits within 32-bit signed integer range"]', '["Just add the two numbers and return the result."]', '["Arithmetic","Basics"]', 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-01', 1, '(1, 2)', '[1,2]', '3', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-01' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-01', 2, '(5, 7)', '[5,7]', '12', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-01' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-01', 3, '(-1, 1)', '[-1,1]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-01' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-01', 4, '(100, 200)', '[100,200]', '300', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-01' AND case_number = 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-01', 5, '(-42, -58)', '[-42,-58]', '-100', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-01' AND case_number = 5);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-02', 'difference-of-two-numbers', 'warmup', 'Difference of Two Numbers', 'Return the difference of two integers.', 'Write a method that takes two integers `a` and `b` and returns `a - b`.', 'Easy', 'subtract', 'public int subtract(int a, int b)', '["int","int"]', 'int', 'public class Solution {
    public int subtract(int a, int b) {
        return 0;
    }
}
', 'public class Solution {
    public int subtract(int a, int b) {
        return a - b;
    }
}
', 'Subtract the second parameter from the first parameter and return the resulting integer.', '[{"input":"10, 3","output":"7"},{"input":"4, 9","output":"-5"}]', '["-10^9 <= a, b <= 10^9"]', '["Return `a - b` directly."]', '["Arithmetic","Basics"]', 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-02', 1, '(10, 3)', '[10,3]', '7', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-02' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-02', 2, '(4, 9)', '[4,9]', '-5', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-02' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-02', 3, '(0, 0)', '[0,0]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-02' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-02', 4, '(-5, -10)', '[-5,-10]', '5', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-02' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-03', 'product-of-two-numbers', 'warmup', 'Product of Two Numbers', 'Return the product of two integers.', 'Write a method that takes two integers `a` and `b` and returns their product `a * b`.', 'Easy', 'multiply', 'public int multiply(int a, int b)', '["int","int"]', 'int', 'public class Solution {
    public int multiply(int a, int b) {
        return 0;
    }
}
', 'public class Solution {
    public int multiply(int a, int b) {
        return a * b;
    }
}
', 'Multiply `a` and `b` using the `*` operator.', '[{"input":"3, 4","output":"12"},{"input":"-2, 8","output":"-16"}]', '["-10^4 <= a, b <= 10^4"]', '["Multiplying by zero should always produce 0."]', '["Arithmetic","Basics"]', 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-03', 1, '(3, 4)', '[3,4]', '12', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-03' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-03', 2, '(-2, 8)', '[-2,8]', '-16', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-03' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-03', 3, '(0, 99)', '[0,99]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-03' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-03', 4, '(-7, -6)', '[-7,-6]', '42', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-03' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-04', 'quotient-of-two-numbers', 'warmup', 'Quotient of Two Numbers', 'Return the integer quotient of two integers.', 'Write a method that takes two integers `a` and `b` (`b != 0`) and returns the integer division quotient `a / b`.', 'Easy', 'divide', 'public int divide(int a, int b)', '["int","int"]', 'int', 'public class Solution {
    public int divide(int a, int b) {
        return 0;
    }
}
', 'public class Solution {
    public int divide(int a, int b) {
        return a / b;
    }
}
', 'Java `/` between two `int` operands performs truncating integer division toward zero.', '[{"input":"20, 4","output":"5"},{"input":"7, 2","output":"3"}]', '["-10^9 <= a, b <= 10^9","b != 0"]', '["Integer division truncates the fractional remainder."]', '["Arithmetic","Basics"]', 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-04', 1, '(20, 4)', '[20,4]', '5', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-04' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-04', 2, '(7, 2)', '[7,2]', '3', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-04' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-04', 3, '(-9, 2)', '[-9,2]', '-4', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-04' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-04', 4, '(100, -10)', '[100,-10]', '-10', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-04' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-05', 'remainder-of-two-numbers', 'warmup', 'Remainder of Two Numbers', 'Return the remainder when dividing two integers.', 'Write a method that takes two integers `a` and `b` (`b != 0`) and returns the remainder of `a` divided by `b`.', 'Easy', 'remainder', 'public int remainder(int a, int b)', '["int","int"]', 'int', 'public class Solution {
    public int remainder(int a, int b) {
        return 0;
    }
}
', 'public class Solution {
    public int remainder(int a, int b) {
        return a % b;
    }
}
', 'Use Java''s modulo operator `%` to obtain the division remainder.', '[{"input":"10, 3","output":"1"},{"input":"15, 5","output":"0"}]', '["-10^9 <= a, b <= 10^9","b != 0"]', '["The `%` operator returns the remainder after integer division."]', '["Arithmetic","Modulo"]', 5);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-05', 1, '(10, 3)', '[10,3]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-05' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-05', 2, '(15, 5)', '[15,5]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-05' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-05', 3, '(29, 6)', '[29,6]', '5', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-05' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-05', 4, '(-10, 3)', '[-10,3]', '-1', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-05' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-06', 'is-even', 'warmup', 'Is Even', 'Check if a number is even.', 'Given an integer `n`, return `true` if `n` is even and `false` otherwise.', 'Medium', 'isEven', 'public boolean isEven(int n)', '["int"]', 'boolean', 'public class Solution {
    public boolean isEven(int n) {
        return false;
    }
}
', 'public class Solution {
    public boolean isEven(int n) {
        return n % 2 == 0;
    }
}
', 'An integer is even if and only if its remainder when divided by 2 equals 0, including negative even integers and 0.', '[{"input":"4","output":"true"},{"input":"-3","output":"false"}]', '["-10^9 <= n <= 10^9"]', '["Remember that negative numbers like -4 are also even (`-4 % 2 == 0`)."]', '["Modulo","Conditionals"]', 6);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-06', 1, '(4)', '[4]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-06' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-06', 2, '(7)', '[7]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-06' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-06', 3, '(0)', '[0]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-06' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-06', 4, '(-8)', '[-8]', 'true', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-06' AND case_number = 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-06', 5, '(-3)', '[-3]', 'false', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-06' AND case_number = 5);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-07', 'is-odd', 'warmup', 'Is Odd', 'Check if a number is odd.', 'Given an integer `n`, return `true` if `n` is odd and `false` otherwise.', 'Medium', 'isOdd', 'public boolean isOdd(int n)', '["int"]', 'boolean', 'public class Solution {
    public boolean isOdd(int n) {
        return false;
    }
}
', 'public class Solution {
    public boolean isOdd(int n) {
        return n % 2 != 0;
    }
}
', 'Avoid checking `n % 2 == 1` because negative odd integers produce `-1` in Java (`-5 % 2 == -1`). Checking `n % 2 != 0` works for both positive and negative integers.', '[{"input":"5","output":"true"},{"input":"-3","output":"true"}]', '["-10^9 <= n <= 10^9"]', '["In Java, `-3 % 2` evaluates to `-1`, not `1`! Compare against `!= 0`."]', '["Modulo","Edge Cases"]', 7);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-07', 1, '(5)', '[5]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-07' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-07', 2, '(10)', '[10]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-07' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-07', 3, '(-3)', '[-3]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-07' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-07', 4, '(0)', '[0]', 'false', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-07' AND case_number = 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-07', 5, '(-12)', '[-12]', 'false', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-07' AND case_number = 5);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-08', 'max-of-two-numbers', 'warmup', 'Max of Two Numbers', 'Return the larger of two integers.', 'Given two integers `a` and `b`, return the larger value.', 'Medium', 'maxOfTwo', 'public int maxOfTwo(int a, int b)', '["int","int"]', 'int', 'public class Solution {
    public int maxOfTwo(int a, int b) {
        return 0;
    }
}
', 'public class Solution {
    public int maxOfTwo(int a, int b) {
        return Math.max(a, b);
    }
}
', 'Compare `a` and `b` using an `if` statement, ternary operator, or `Math.max(a, b)`.', '[{"input":"8, 3","output":"8"},{"input":"-4, -1","output":"-1"}]', '["-10^9 <= a, b <= 10^9"]', '["Try `a >= b ? a : b` or `Math.max(a, b)`."]', '["Conditionals","Math"]', 8);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-08', 1, '(8, 3)', '[8,3]', '8', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-08' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-08', 2, '(-4, -1)', '[-4,-1]', '-1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-08' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-08', 3, '(5, 5)', '[5,5]', '5', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-08' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-08', 4, '(-100, 0)', '[-100,0]', '0', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-08' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-09', 'min-of-two-numbers', 'warmup', 'Min of Two Numbers', 'Return the smaller of two integers.', 'Given two integers `a` and `b`, return the smaller value.', 'Medium', 'minOfTwo', 'public int minOfTwo(int a, int b)', '["int","int"]', 'int', 'public class Solution {
    public int minOfTwo(int a, int b) {
        return 0;
    }
}
', 'public class Solution {
    public int minOfTwo(int a, int b) {
        return Math.min(a, b);
    }
}
', 'Use `Math.min(a, b)` or a ternary comparison `a <= b ? a : b`.', '[{"input":"8, 3","output":"3"},{"input":"-4, -1","output":"-4"}]', '["-10^9 <= a, b <= 10^9"]', '["Compare `a` and `b` and return whichever is smaller."]', '["Conditionals","Math"]', 9);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-09', 1, '(8, 3)', '[8,3]', '3', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-09' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-09', 2, '(-4, -1)', '[-4,-1]', '-4', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-09' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-09', 3, '(5, 5)', '[5,5]', '5', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-09' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-09', 4, '(0, 12)', '[0,12]', '0', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-09' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('warmup-10', 'absolute-value', 'warmup', 'Absolute Value', 'Return the absolute value of a number.', 'Given an integer `n`, return its non-negative magnitude without relying on sign assumptions.', 'Hard', 'absValue', 'public int absValue(int n)', '["int"]', 'int', 'public class Solution {
    public int absValue(int n) {
        return 0;
    }
}
', 'public class Solution {
    public int absValue(int n) {
        return n < 0 ? -n : n;
    }
}
', 'Negate `n` when `n < 0`; otherwise return `n` unchanged.', '[{"input":"-42","output":"42"},{"input":"17","output":"17"}]', '["-10^9 <= n <= 10^9"]', '["If `n < 0`, return `-n`."]', '["Conditionals","Math"]', 10);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-10', 1, '(-42)', '[-42]', '42', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-10' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-10', 2, '(17)', '[17]', '17', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-10' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-10', 3, '(0)', '[0]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-10' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'warmup-10', 4, '(-1000000)', '[-1000000]', '1000000', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'warmup-10' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('string-01', 'reverse-string', 'string', 'Reverse String', 'Return a string with its characters in reverse order.', 'Given a string `s`, return a new string containing the characters of `s` from last to first.', 'Easy', 'reverseString', 'public String reverseString(String s)', '["String"]', 'String', 'public class Solution {
    public String reverseString(String s) {
        return "";
    }
}
', 'public class Solution {
    public String reverseString(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}
', '`StringBuilder.reverse()` reverses characters in O(n) time. You can also iterate backward from `s.length() - 1` down to `0`.', '[{"input":"\"hello\"","output":"olleh"},{"input":"\"Java\"","output":"avaJ"}]', '["0 <= s.length() <= 10^4"]', '["Use `StringBuilder` or a backward `for` loop."]', '["StringBuilder","Loops"]', 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-01', 1, '("hello")', '["hello"]', 'olleh', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-01' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-01', 2, '("Java")', '["Java"]', 'avaJ', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-01' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-01', 3, '("a")', '["a"]', 'a', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-01' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-01', 4, '("")', '[""]', '', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-01' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('string-02', 'palindrome-check', 'string', 'Palindrome Check', 'Determine whether a string reads the same forward and backward.', 'Given a lowercase string `s`, return `true` if `s` is a palindrome, and `false` otherwise.', 'Easy', 'isPalindrome', 'public boolean isPalindrome(String s)', '["String"]', 'boolean', 'public class Solution {
    public boolean isPalindrome(String s) {
        return false;
    }
}
', 'public class Solution {
    public boolean isPalindrome(String s) {
        int left = 0;
        int right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}
', 'Two pointers starting from both ends verify symmetry in O(n) time and O(1) extra space.', '[{"input":"\"racecar\"","output":"true"},{"input":"\"algo\"","output":"false"}]', '["0 <= s.length() <= 10^4","s consists of lowercase ASCII letters"]', '["Compare `s.charAt(left)` with `s.charAt(right)` while `left < right`."]', '["Two Pointers","String"]', 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-02', 1, '("racecar")', '["racecar"]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-02' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-02', 2, '("algo")', '["algo"]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-02' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-02', 3, '("a")', '["a"]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-02' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-02', 4, '("abba")', '["abba"]', 'true', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-02' AND case_number = 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-02', 5, '("")', '[""]', 'true', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-02' AND case_number = 5);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('string-03', 'count-vowels', 'string', 'Count Vowels', 'Count the number of English vowels in a string.', 'Given a string `s`, return the count of vowel characters (`a, e, i, o, u`, case-insensitive) appearing in `s`.', 'Easy', 'countVowels', 'public int countVowels(String s)', '["String"]', 'int', 'public class Solution {
    public int countVowels(String s) {
        return 0;
    }
}
', 'public class Solution {
    public int countVowels(String s) {
        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = Character.toLowerCase(s.charAt(i));
            if (ch == ''a'' || ch == ''e'' || ch == ''i'' || ch == ''o'' || ch == ''u'') {
                count++;
            }
        }
        return count;
    }
}
', 'Normalize each character with `Character.toLowerCase` and increment the counter when it matches one of the five vowels.', '[{"input":"\"AlgoJava\"","output":"4"},{"input":"\"rhythm\"","output":"0"}]', '["0 <= s.length() <= 10^4"]', '["Remember to handle both uppercase and lowercase letters."]', '["Iteration","Characters"]', 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-03', 1, '("AlgoJava")', '["AlgoJava"]', '4', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-03' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-03', 2, '("rhythm")', '["rhythm"]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-03' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-03', 3, '("AEIOU")', '["AEIOU"]', '5', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-03' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-03', 4, '("")', '[""]', '0', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-03' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('string-04', 'anagram-check', 'string', 'Anagram Check', 'Check if two strings are anagrams of each other.', 'Given two lowercase strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.', 'Medium', 'isAnagram', 'public boolean isAnagram(String s, String t)', '["String","String"]', 'boolean', 'public class Solution {
    public boolean isAnagram(String s, String t) {
        return false;
    }
}
', 'public class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] counts = new int[26];
        for (int i = 0; i < s.length(); i++) {
            counts[s.charAt(i) - ''a'']++;
            counts[t.charAt(i) - ''a'']--;
        }
        for (int c : counts) {
            if (c != 0) return false;
        }
        return true;
    }
}
', 'Count character frequencies with a fixed 26-slot array: increment for `s`, decrement for `t`, then verify every slot is zero.', '[{"input":"\"listen\", \"silent\"","output":"true"},{"input":"\"rat\", \"car\"","output":"false"}]', '["0 <= s.length(), t.length() <= 5 * 10^4","s and t contain lowercase English letters"]', '["If lengths differ, return false immediately. Otherwise use an `int[26]` frequency array."]', '["Hashing","Frequency Count"]', 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-04', 1, '("listen", "silent")', '["listen","silent"]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-04' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-04', 2, '("rat", "car")', '["rat","car"]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-04' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-04', 3, '("anagram", "nagaram")', '["anagram","nagaram"]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-04' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-04', 4, '("a", "ab")', '["a","ab"]', 'false', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-04' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('string-05', 'longest-common-prefix', 'string', 'Longest Common Prefix', 'Find the longest shared prefix among an array of strings.', 'Write a method to find the longest common prefix string amongst an array of strings `strs`. If there is no common prefix, return an empty string `""`.', 'Medium', 'longestCommonPrefix', 'public String longestCommonPrefix(String[] strs)', '["String[]"]', 'String', 'public class Solution {
    public String longestCommonPrefix(String[] strs) {
        return "";
    }
}
', 'public class Solution {
    public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) return "";
        String prefix = strs[0];
        for (int i = 1; i < strs.length; i++) {
            while (!strs[i].startsWith(prefix)) {
                prefix = prefix.substring(0, prefix.length() - 1);
                if (prefix.isEmpty()) return "";
            }
        }
        return prefix;
    }
}
', 'Start with `strs[0]` as the candidate prefix and shrink it one character from the end until every subsequent string starts with it.', '[{"input":"[\"flower\",\"flow\",\"flight\"]","output":"fl"},{"input":"[\"dog\",\"racecar\",\"car\"]","output":""}]', '["1 <= strs.length <= 200","0 <= strs[i].length() <= 200"]', '["Use `String.startsWith` and trim `prefix` until it matches."]', '["String","Prefix"]', 5);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-05', 1, '(["flower","flow","flight"])', '[["flower","flow","flight"]]', 'fl', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-05' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-05', 2, '(["dog","racecar","car"])', '[["dog","racecar","car"]]', '', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-05' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-05', 3, '(["java"])', '[["java"]]', 'java', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-05' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'string-05', 4, '(["interspecies","interstellar","interstate"])', '[["interspecies","interstellar","interstate"]]', 'inters', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'string-05' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('array-01', 'sum-of-array-elements', 'array', 'Sum of Array Elements', 'Compute the sum of all integers in an array.', 'Given an integer array `nums`, return the sum of all its elements.', 'Easy', 'arraySum', 'public int arraySum(int[] nums)', '["int[]"]', 'int', 'public class Solution {
    public int arraySum(int[] nums) {
        return 0;
    }
}
', 'public class Solution {
    public int arraySum(int[] nums) {
        int total = 0;
        for (int num : nums) {
            total += num;
        }
        return total;
    }
}
', 'Accumulate each array element in an enhanced `for` loop in O(n) time.', '[{"input":"[1, 2, 3, 4]","output":"10"},{"input":"[-2, 5, -1]","output":"2"}]', '["0 <= nums.length <= 10^4"]', '["Initialize an accumulator variable `total = 0` and loop over `nums`."]', '["Array","Loop"]', 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-01', 1, '([1, 2, 3, 4])', '[[1,2,3,4]]', '10', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-01' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-01', 2, '([-2, 5, -1])', '[[-2,5,-1]]', '2', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-01' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-01', 3, '([])', '[[]]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-01' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-01', 4, '([100])', '[[100]]', '100', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-01' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('array-02', 'two-sum-indices', 'array', 'Two Sum Indices', 'Find indices of two numbers that add up to a target.', 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target` (ordered `[i, j]` with `i < j`). Assume each input has exactly one valid solution.', 'Easy', 'twoSum', 'public int[] twoSum(int[] nums, int target)', '["int[]","int"]', 'int[]', 'public class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[0];
    }
}
', 'import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}
', 'Store previously visited values and their indices in a `HashMap` so each complement lookup takes O(1) average time.', '[{"input":"[2, 7, 11, 15], 9","output":"[0, 1]"},{"input":"[3, 2, 4], 6","output":"[1, 2]"}]', '["2 <= nums.length <= 10^4","Exactly one solution exists"]', '["For each element `x`, check whether `target - x` was already seen."]', '["HashMap","Array"]', 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-02', 1, '([2, 7, 11, 15], 9)', '[[2,7,11,15],9]', '[0, 1]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-02' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-02', 2, '([3, 2, 4], 6)', '[[3,2,4],6]', '[1, 2]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-02' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-02', 3, '([3, 3], 6)', '[[3,3],6]', '[0, 1]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-02' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-02', 4, '([-1, -2, -3, -4, -5], -8)', '[[-1,-2,-3,-4,-5],-8]', '[2, 4]', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-02' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('array-03', 'rotate-array-left', 'array', 'Rotate Array Left', 'Rotate all elements of an array to the left by k positions.', 'Given an integer array `nums` and a non-negative integer `k`, return a new array rotated to the left by `k` steps.', 'Medium', 'rotateLeft', 'public int[] rotateLeft(int[] nums, int k)', '["int[]","int"]', 'int[]', 'public class Solution {
    public int[] rotateLeft(int[] nums, int k) {
        return new int[0];
    }
}
', 'public class Solution {
    public int[] rotateLeft(int[] nums, int k) {
        if (nums.length == 0) return new int[0];
        int n = nums.length;
        int shift = k % n;
        int[] res = new int[n];
        for (int i = 0; i < n; i++) {
            res[i] = nums[(i + shift) % n];
        }
        return res;
    }
}
', 'Reduce `k` modulo `nums.length`, then place `nums[(i + shift) % n]` at index `i` in the result array.', '[{"input":"[1, 2, 3, 4, 5], 2","output":"[3, 4, 5, 1, 2]"},{"input":"[10, 20, 30], 4","output":"[20, 30, 10]"}]', '["0 <= nums.length <= 10^4","0 <= k <= 10^5"]', '["Remember to wrap `k` using `k % nums.length` when `nums.length > 0`."]', '["Array","Indexing"]', 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-03', 1, '([1, 2, 3, 4, 5], 2)', '[[1,2,3,4,5],2]', '[3, 4, 5, 1, 2]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-03' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-03', 2, '([10, 20, 30], 4)', '[[10,20,30],4]', '[20, 30, 10]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-03' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-03', 3, '([7], 5)', '[[7],5]', '[7]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-03' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-03', 4, '([], 3)', '[[],3]', '[]', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-03' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('array-04', 'maximum-subarray', 'array', 'Maximum Subarray', 'Find the contiguous subarray with the largest sum.', 'Given an integer array `nums`, find the contiguous non-empty subarray which has the largest sum and return its sum.', 'Medium', 'maxSubArray', 'public int maxSubArray(int[] nums)', '["int[]"]', 'int', 'public class Solution {
    public int maxSubArray(int[] nums) {
        return 0;
    }
}
', 'public class Solution {
    public int maxSubArray(int[] nums) {
        int current = nums[0];
        int best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            current = Math.max(nums[i], current + nums[i]);
            best = Math.max(best, current);
        }
        return best;
    }
}
', 'Kadane''s algorithm tracks the best subarray ending at index `i` in O(n) time and O(1) space.', '[{"input":"[-2, 1, -3, 4, -1, 2, 1, -5, 4]","output":"6"},{"input":"[-5, -1, -8]","output":"-1"}]', '["1 <= nums.length <= 10^5","-10^4 <= nums[i] <= 10^4"]', '["At each index, decide whether to extend the previous subarray or start fresh at `nums[i]`."]', '["Kadane","Dynamic Programming"]', 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-04', 1, '([-2, 1, -3, 4, -1, 2, 1, -5, 4])', '[[-2,1,-3,4,-1,2,1,-5,4]]', '6', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-04' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-04', 2, '([1])', '[[1]]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-04' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-04', 3, '([-5, -1, -8])', '[[-5,-1,-8]]', '-1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-04' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-04', 4, '([5, 4, -1, 7, 8])', '[[5,4,-1,7,8]]', '23', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-04' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('array-05', 'product-except-self', 'array', 'Product of Array Except Self', 'Return an array where each index holds the product of all other elements.', 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. Solve without using division.', 'Hard', 'productExceptSelf', 'public int[] productExceptSelf(int[] nums)', '["int[]"]', 'int[]', 'public class Solution {
    public int[] productExceptSelf(int[] nums) {
        return new int[0];
    }
}
', 'public class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] ans = new int[n];
        int left = 1;
        for (int i = 0; i < n; i++) {
            ans[i] = left;
            left *= nums[i];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            ans[i] *= right;
            right *= nums[i];
        }
        return ans;
    }
}
', 'Compute prefix products in a forward pass, then multiply suffix products in a backward pass in O(n) time without division.', '[{"input":"[1, 2, 3, 4]","output":"[24, 12, 8, 6]"},{"input":"[-1, 1, 0, -3, 3]","output":"[0, 0, 9, 0, 0]"}]', '["2 <= nums.length <= 10^5","Do not use the division operator"]', '["Combine prefix products from the left with suffix products from the right."]', '["Prefix Product","Array"]', 5);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-05', 1, '([1, 2, 3, 4])', '[[1,2,3,4]]', '[24, 12, 8, 6]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-05' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-05', 2, '([-1, 1, 0, -3, 3])', '[[-1,1,0,-3,3]]', '[0, 0, 9, 0, 0]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-05' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-05', 3, '([0, 0])', '[[0,0]]', '[0, 0]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-05' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'array-05', 4, '([2, 3, 5])', '[[2,3,5]]', '[15, 10, 6]', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'array-05' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('logic-01', 'cigar-party', 'logic', 'Cigar Party', 'Check if a squirrel party succeeds based on cigar count and weekend status.', 'When squirrels get together for a party, they like to have cigars. A squirrel party is successful when the number of cigars is between 40 and 60, inclusive. Unless it is the weekend, in which case there is no upper bound on the number of cigars.', 'Easy', 'cigarParty', 'public boolean cigarParty(int cigars, boolean isWeekend)', '["int","boolean"]', 'boolean', 'public class Solution {
    public boolean cigarParty(int cigars, boolean isWeekend) {
        return false;
    }
}
', 'public class Solution {
    public boolean cigarParty(int cigars, boolean isWeekend) {
        if (isWeekend) {
            return cigars >= 40;
        }
        return cigars >= 40 && cigars <= 60;
    }
}
', 'Check `cigars >= 40` first; if `isWeekend` is false, also enforce `cigars <= 60`.', '[{"input":"30, false","output":"false"},{"input":"70, true","output":"true"}]', '["0 <= cigars <= 1000"]', '["Handle `isWeekend == true` and `isWeekend == false` cleanly."]', '["Boolean Logic"]', 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-01', 1, '(30, false)', '[30,false]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-01' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-01', 2, '(50, false)', '[50,false]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-01' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-01', 3, '(70, true)', '[70,true]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-01' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-01', 4, '(60, false)', '[60,false]', 'true', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-01' AND case_number = 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-01', 5, '(39, true)', '[39,true]', 'false', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-01' AND case_number = 5);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('logic-02', 'caught-speeding', 'logic', 'Caught Speeding', 'Compute the speeding ticket tier (0, 1, or 2).', 'You are driving a little too fast, and a police officer stops you. Write code to compute the result, encoded as an int value: `0` = no ticket, `1` = small ticket, `2` = big ticket. If `speed` is 60 or less, result is 0. Between 61 and 80 inclusive, result is 1. 81 or more, result is 2. Unless it is your birthday -- on your birthday, your speed can be 5 higher in all cases.', 'Easy', 'caughtSpeeding', 'public int caughtSpeeding(int speed, boolean isBirthday)', '["int","boolean"]', 'int', 'public class Solution {
    public int caughtSpeeding(int speed, boolean isBirthday) {
        return 0;
    }
}
', 'public class Solution {
    public int caughtSpeeding(int speed, boolean isBirthday) {
        int bonus = isBirthday ? 5 : 0;
        if (speed <= 60 + bonus) return 0;
        if (speed <= 80 + bonus) return 1;
        return 2;
    }
}
', 'Add a 5 mph birthday allowance to the thresholds before evaluating the speed brackets.', '[{"input":"60, false","output":"0"},{"input":"65, true","output":"0"}]', '["0 <= speed <= 200"]', '["Add `5` to the speed limits when `isBirthday` is true."]', '["Conditionals"]', 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-02', 1, '(60, false)', '[60,false]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-02' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-02', 2, '(65, false)', '[65,false]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-02' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-02', 3, '(65, true)', '[65,true]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-02' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-02', 4, '(85, false)', '[85,false]', '2', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-02' AND case_number = 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-02', 5, '(85, true)', '[85,true]', '1', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-02' AND case_number = 5);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('logic-03', 'fizz-buzz-value', 'logic', 'FizzBuzz Value', 'Return Fizz, Buzz, FizzBuzz, or the string number.', 'Given an integer `n`, return `"FizzBuzz"` if `n` is divisible by both 3 and 5, `"Fizz"` if divisible by 3, `"Buzz"` if divisible by 5, or `String.valueOf(n)` otherwise.', 'Easy', 'fizzBuzzValue', 'public String fizzBuzzValue(int n)', '["int"]', 'String', 'public class Solution {
    public String fizzBuzzValue(int n) {
        return "";
    }
}
', 'public class Solution {
    public String fizzBuzzValue(int n) {
        if (n % 15 == 0) return "FizzBuzz";
        if (n % 3 == 0) return "Fizz";
        if (n % 5 == 0) return "Buzz";
        return String.valueOf(n);
    }
}
', 'Check divisibility by both 3 and 5 (`n % 15 == 0`) before checking 3 or 5 individually.', '[{"input":"15","output":"FizzBuzz"},{"input":"7","output":"7"}]', '["1 <= n <= 10^5"]', '["Test the `3 && 5` condition first."]', '["Modulo","Conditionals"]', 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-03', 1, '(15)', '[15]', 'FizzBuzz', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-03' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-03', 2, '(9)', '[9]', 'Fizz', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-03' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-03', 3, '(10)', '[10]', 'Buzz', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-03' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-03', 4, '(7)', '[7]', '7', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-03' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('logic-04', 'teen-sum', 'logic', 'Teen Sum', 'Return sum unless either value is a teen (13..19).', 'Given 2 ints, `a` and `b`, return their sum. However, "teen" values in the range 13..19 inclusive are extra lucky. So if either value is a teen, just return 19.', 'Medium', 'teenSum', 'public int teenSum(int a, int b)', '["int","int"]', 'int', 'public class Solution {
    public int teenSum(int a, int b) {
        return 0;
    }
}
', 'public class Solution {
    public int teenSum(int a, int b) {
        boolean aTeen = a >= 13 && a <= 19;
        boolean bTeen = b >= 13 && b <= 19;
        return (aTeen || bTeen) ? 19 : a + b;
    }
}
', 'Check whether either argument falls inside `[13, 19]` before returning `a + b`.', '[{"input":"3, 4","output":"7"},{"input":"10, 13","output":"19"}]', '["-10^4 <= a, b <= 10^4"]', '["Inclusive range 13..19 includes both 13 and 19."]', '["Conditionals","Ranges"]', 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-04', 1, '(3, 4)', '[3,4]', '7', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-04' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-04', 2, '(10, 13)', '[10,13]', '19', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-04' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-04', 3, '(19, 20)', '[19,20]', '19', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-04' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-04', 4, '(12, 20)', '[12,20]', '32', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-04' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('logic-05', 'leap-year-check', 'logic', 'Leap Year Check', 'Determine if a Gregorian calendar year is a leap year.', 'Given a positive year `year`, return `true` if it is a leap year: divisible by 4, except years divisible by 100 are not leap years unless they are also divisible by 400.', 'Medium', 'isLeapYear', 'public boolean isLeapYear(int year)', '["int"]', 'boolean', 'public class Solution {
    public boolean isLeapYear(int year) {
        return false;
    }
}
', 'public class Solution {
    public boolean isLeapYear(int year) {
        return (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0);
    }
}
', 'Combine the 400-year exception with the 4-year rule in a single boolean expression.', '[{"input":"2024","output":"true"},{"input":"1900","output":"false"}]', '["1 <= year <= 9999"]', '["Years divisible by 400 (like 2000) ARE leap years; 1900 is NOT."]', '["Boolean Logic"]', 5);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-05', 1, '(2024)', '[2024]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-05' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-05', 2, '(1900)', '[1900]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-05' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-05', 3, '(2000)', '[2000]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-05' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'logic-05', 4, '(2023)', '[2023]', 'false', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'logic-05' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('ap-01', 'scores-increasing', 'ap', 'Scores Increasing', 'Verify whether scores are in non-decreasing order.', 'Given an array of scores, return `true` if each score is equal to or greater than the one before. The array will be length 2 or more.', 'Easy', 'scoresIncreasing', 'public boolean scoresIncreasing(int[] scores)', '["int[]"]', 'boolean', 'public class Solution {
    public boolean scoresIncreasing(int[] scores) {
        return false;
    }
}
', 'public class Solution {
    public boolean scoresIncreasing(int[] scores) {
        for (int i = 1; i < scores.length; i++) {
            if (scores[i] < scores[i - 1]) {
                return false;
            }
        }
        return true;
    }
}
', 'Scan adjacent pairs; as soon as any score drops below the previous score, return `false`.', '[{"input":"[1, 3, 4]","output":"true"},{"input":"[1, 3, 2]","output":"false"}]', '["2 <= scores.length <= 10^4"]', '["Equal consecutive scores like `[1, 1, 4]` count as non-decreasing."]', '["AP CS","Array"]', 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-01', 1, '([1, 3, 4])', '[[1,3,4]]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-01' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-01', 2, '([1, 3, 2])', '[[1,3,2]]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-01' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-01', 3, '([1, 1, 4])', '[[1,1,4]]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-01' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-01', 4, '([-5, 0, 5])', '[[-5,0,5]]', 'true', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-01' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('ap-02', 'words-count', 'ap', 'Words Count', 'Count strings that match a target length.', 'Given an array of strings `words`, return the count of the number of strings with the given length `len`.', 'Easy', 'wordsCount', 'public int wordsCount(String[] words, int len)', '["String[]","int"]', 'int', 'public class Solution {
    public int wordsCount(String[] words, int len) {
        return 0;
    }
}
', 'public class Solution {
    public int wordsCount(String[] words, int len) {
        int count = 0;
        for (String word : words) {
            if (word.length() == len) {
                count++;
            }
        }
        return count;
    }
}
', 'Iterate over `words` and count elements where `word.length() == len`.', '[{"input":"[\"a\", \"bb\", \"b\", \"ccc\"], 1","output":"2"},{"input":"[\"a\", \"bb\", \"b\", \"ccc\"], 3","output":"1"}]', '["0 <= words.length <= 10^4","0 <= len <= 1000"]', '["Use `word.length()` to check string length."]', '["AP CS","String[]"]', 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-02', 1, '(["a", "bb", "b", "ccc"], 1)', '[["a","bb","b","ccc"],1]', '2', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-02' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-02', 2, '(["a", "bb", "b", "ccc"], 3)', '[["a","bb","b","ccc"],3]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-02' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-02', 3, '(["hello", "world"], 4)', '[["hello","world"],4]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-02' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-02', 4, '([], 1)', '[[],1]', '0', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-02' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('ap-03', 'scores-clump', 'ap', 'Scores Clump', 'Find 3 adjacent scores that differ by at most 2.', 'Given an array of scores sorted in increasing order, return `true` if the array contains 3 adjacent scores that differ from each other by at most 2, such as with `{3, 4, 5}` or `{3, 5, 5}`.', 'Medium', 'scoresClump', 'public boolean scoresClump(int[] scores)', '["int[]"]', 'boolean', 'public class Solution {
    public boolean scoresClump(int[] scores) {
        return false;
    }
}
', 'public class Solution {
    public boolean scoresClump(int[] scores) {
        for (int i = 0; i <= scores.length - 3; i++) {
            if (scores[i + 2] - scores[i] <= 2) {
                return true;
            }
        }
        return false;
    }
}
', 'Since `scores` is sorted, the spread across any 3-element window `[i, i+1, i+2]` is simply `scores[i + 2] - scores[i]`.', '[{"input":"[3, 4, 5]","output":"true"},{"input":"[3, 4, 6]","output":"false"}]', '["0 <= scores.length <= 10^4","scores is sorted in non-decreasing order"]', '["For sorted values, you only need to compare `scores[i + 2] - scores[i] <= 2`."]', '["AP CS","Sliding Window"]', 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-03', 1, '([3, 4, 5])', '[[3,4,5]]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-03' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-03', 2, '([3, 4, 6])', '[[3,4,6]]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-03' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-03', 3, '([1, 3, 5, 5])', '[[1,3,5,5]]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-03' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-03', 4, '([2, 4])', '[[2,4]]', 'false', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-03' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('ap-04', 'has-digit-one', 'ap', 'Has Digit One', 'Check whether a positive integer contains digit 1.', 'Given a positive integer `n`, return `true` if it contains a `1` digit. Note: use `%` to get the rightmost digit, and `/` to discard the rightmost digit.', 'Medium', 'hasOne', 'public boolean hasOne(int n)', '["int"]', 'boolean', 'public class Solution {
    public boolean hasOne(int n) {
        return false;
    }
}
', 'public class Solution {
    public boolean hasOne(int n) {
        while (n > 0) {
            if (n % 10 == 1) return true;
            n /= 10;
        }
        return false;
    }
}
', 'Repeatedly peel off the least significant digit using `n % 10` and `n /= 10`.', '[{"input":"10","output":"true"},{"input":"22","output":"false"}]', '["1 <= n <= 10^9"]', '["Check `n % 10 == 1` inside a `while (n > 0)` loop."]', '["AP CS","Digits"]', 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-04', 1, '(10)', '[10]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-04' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-04', 2, '(22)', '[22]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-04' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-04', 3, '(2201)', '[2201]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-04' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-04', 4, '(999)', '[999]', 'false', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-04' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('ap-05', 'merge-two-sorted-arrays', 'ap', 'Merge Two Sorted Arrays', 'Merge the first n unique sorted strings from two sorted arrays.', 'Start with two arrays of strings, `a` and `b`, each in alphabetical order, possibly with duplicates. Return a new array of length `n`, containing the first `n` elements from the two arrays together in alphabetical order without duplicates. You may assume `a` and `b` have enough unique elements.', 'Hard', 'mergeTwo', 'public String[] mergeTwo(String[] a, String[] b, int n)', '["String[]","String[]","int"]', 'String[]', 'public class Solution {
    public String[] mergeTwo(String[] a, String[] b, int n) {
        return new String[0];
    }
}
', 'public class Solution {
    public String[] mergeTwo(String[] a, String[] b, int n) {
        String[] out = new String[n];
        int ia = 0, ib = 0;
        for (int i = 0; i < n; i++) {
            int cmp = a[ia].compareTo(b[ib]);
            if (cmp < 0) {
                out[i] = a[ia++];
            } else if (cmp > 0) {
                out[i] = b[ib++];
            } else {
                out[i] = a[ia++];
                ib++;
            }
        }
        return out;
    }
}
', 'Advance two pointers through `a` and `b` using `compareTo`. When both pointers reference equal strings, advance both pointers to skip duplicates.', '[{"input":"[\"a\",\"c\",\"z\"], [\"b\",\"f\",\"z\"], 3","output":"[\"a\", \"b\", \"c\"]"},{"input":"[\"a\",\"c\",\"z\"], [\"c\",\"f\",\"z\"], 3","output":"[\"a\", \"c\", \"f\"]"}]', '["1 <= n <= a.length + b.length","Arrays a and b are sorted ascending"]', '["Use `a[ia].compareTo(b[ib])` and advance both indices when equal."]', '["AP CS","Merge"]', 5);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-05', 1, '(["a","c","z"], ["b","f","z"], 3)', '[["a","c","z"],["b","f","z"],3]', '["a", "b", "c"]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-05' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-05', 2, '(["a","c","z"], ["c","f","z"], 3)', '[["a","c","z"],["c","f","z"],3]', '["a", "c", "f"]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-05' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'ap-05', 3, '(["f","g","z"], ["c","f","g"], 3)', '[["f","g","z"],["c","f","g"],3]', '["c", "f", "g"]', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'ap-05' AND case_number = 3);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('rec-01', 'factorial', 'recursion', 'Factorial', 'Compute n! recursively.', 'Given `n` of `0` or more, return the factorial of `n`, which is `n * (n-1) * (n-2) ... 1` (with `0! = 1`). Compute the result recursively.', 'Easy', 'factorial', 'public long factorial(int n)', '["int"]', 'long', 'public class Solution {
    public long factorial(int n) {
        return 1L;
    }
}
', 'public class Solution {
    public long factorial(int n) {
        if (n <= 1) return 1L;
        return n * factorial(n - 1);
    }
}
', 'Base case `n <= 1` returns `1L`; recursive step multiplies `n` by `factorial(n - 1)`.', '[{"input":"5","output":"120"},{"input":"0","output":"1"}]', '["0 <= n <= 20"]', '["Use `long` arithmetic so values up to `20!` do not overflow."]', '["Recursion","Math"]', 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-01', 1, '(1)', '[1]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-01' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-01', 2, '(5)', '[5]', '120', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-01' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-01', 3, '(0)', '[0]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-01' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-01', 4, '(12)', '[12]', '479001600', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-01' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('rec-02', 'fibonacci-number', 'recursion', 'Fibonacci Number', 'Compute the nth Fibonacci number.', 'The Fibonacci sequence is a famous bit of mathematics, and it happens to have a recursive definition. The first two values in the sequence are `0` and `1` (essentially 2 base cases). Each subsequent value is the sum of the previous two values: `0, 1, 1, 2, 3, 5, 8, ...`.', 'Easy', 'fibonacci', 'public int fibonacci(int n)', '["int"]', 'int', 'public class Solution {
    public int fibonacci(int n) {
        return 0;
    }
}
', 'public class Solution {
    public int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}
', 'Base cases `fibonacci(0) = 0` and `fibonacci(1) = 1`; recursive case `fibonacci(n - 1) + fibonacci(n - 2)`.', '[{"input":"6","output":"8"},{"input":"0","output":"0"}]', '["0 <= n <= 30"]', '["Handle both `n == 0` and `n == 1` as base cases."]', '["Recursion"]', 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-02', 1, '(0)', '[0]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-02' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-02', 2, '(1)', '[1]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-02' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-02', 3, '(6)', '[6]', '8', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-02' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-02', 4, '(10)', '[10]', '55', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-02' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('rec-03', 'sum-of-digits', 'recursion', 'Sum of Digits', 'Sum all decimal digits of a non-negative integer recursively.', 'Given a non-negative int `n`, return the sum of its digits recursively (no loops). Note that mod (`%`) by 10 yields the rightmost digit, while divide (`/`) by 10 removes the rightmost digit.', 'Medium', 'sumDigits', 'public int sumDigits(int n)', '["int"]', 'int', 'public class Solution {
    public int sumDigits(int n) {
        return 0;
    }
}
', 'public class Solution {
    public int sumDigits(int n) {
        if (n < 10) return n;
        return (n % 10) + sumDigits(n / 10);
    }
}
', 'Peel off the last digit `n % 10` and add the recursive sum of the remaining prefix `n / 10`.', '[{"input":"126","output":"9"},{"input":"49","output":"13"}]', '["0 <= n <= 10^9"]', '["Base case when `n < 10` returns `n`."]', '["Recursion","Digits"]', 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-03', 1, '(126)', '[126]', '9', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-03' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-03', 2, '(49)', '[49]', '13', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-03' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-03', 3, '(0)', '[0]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-03' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-03', 4, '(99999)', '[99999]', '45', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-03' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('rec-04', 'count-sevens', 'recursion', 'Count Sevens', 'Count occurrences of digit 7 in a number recursively.', 'Given a non-negative int `n`, return the count of the occurrences of `7` as a digit, so for example `717` yields `2` (no loops).', 'Medium', 'count7', 'public int count7(int n)', '["int"]', 'int', 'public class Solution {
    public int count7(int n) {
        return 0;
    }
}
', 'public class Solution {
    public int count7(int n) {
        if (n == 0) return 0;
        int hit = (n % 10 == 7) ? 1 : 0;
        return hit + count7(n / 10);
    }
}
', 'Add 1 if the last digit is 7, then recurse on `n / 10` until `n == 0`.', '[{"input":"717","output":"2"},{"input":"123","output":"0"}]', '["0 <= n <= 10^9"]', '["Use `(n % 10 == 7 ? 1 : 0) + count7(n / 10)`."]', '["Recursion","Digits"]', 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-04', 1, '(717)', '[717]', '2', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-04' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-04', 2, '(7)', '[7]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-04' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-04', 3, '(123)', '[123]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-04' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-04', 4, '(77077)', '[77077]', '4', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-04' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('rec-05', 'power-n', 'recursion', 'Power N', 'Compute base^n recursively using fast exponentiation.', 'Given `base` and `n` that are both `0` or more (`n >= 0`), compute recursively the value of `base` to the `n` power, so `powerN(3, 2)` is `9`.', 'Hard', 'powerN', 'public long powerN(int base, int n)', '["int","int"]', 'long', 'public class Solution {
    public long powerN(int base, int n) {
        return 1L;
    }
}
', 'public class Solution {
    public long powerN(int base, int n) {
        if (n == 0) return 1L;
        long half = powerN(base, n / 2);
        return (n % 2 == 0) ? half * half : half * half * base;
    }
}
', 'Binary exponentiation halves `n` at every step to compute `base^n` in O(log n) recursive depth.', '[{"input":"3, 2","output":"9"},{"input":"2, 10","output":"1024"}]', '["0 <= base <= 20","0 <= n <= 15"]', '["Divide `n` by 2 on each recursive step and square the half result."]', '["Recursion","Binary Exponentiation"]', 5);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-05', 1, '(3, 1)', '[3,1]', '3', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-05' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-05', 2, '(3, 2)', '[3,2]', '9', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-05' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-05', 3, '(2, 10)', '[2,10]', '1024', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-05' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'rec-05', 4, '(5, 0)', '[5,0]', '1', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'rec-05' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('sort-01', 'bubble-sort', 'sorting', 'Bubble Sort', 'Sort an integer array in ascending order using Bubble Sort.', 'Given an integer array `nums`, sort it in ascending order and return the sorted array.', 'Easy', 'bubbleSort', 'public int[] bubbleSort(int[] nums)', '["int[]"]', 'int[]', 'public class Solution {
    public int[] bubbleSort(int[] nums) {
        return nums;
    }
}
', 'public class Solution {
    public int[] bubbleSort(int[] nums) {
        for (int i = 0; i < nums.length - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < nums.length - 1 - i; j++) {
                if (nums[j] > nums[j + 1]) {
                    int tmp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = tmp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
        return nums;
    }
}
', 'Repeatedly swap adjacent out-of-order pairs and stop early if a full pass performs zero swaps.', '[{"input":"[5, 1, 4, 2, 8]","output":"[1, 2, 4, 5, 8]"},{"input":"[3, -1, 0]","output":"[-1, 0, 3]"}]', '["0 <= nums.length <= 2000"]', '["An early-exit `swapped` flag turns already-sorted arrays into O(n)."]', '["Sorting","Bubble Sort"]', 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-01', 1, '([5, 1, 4, 2, 8])', '[[5,1,4,2,8]]', '[1, 2, 4, 5, 8]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-01' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-01', 2, '([3, -1, 0])', '[[3,-1,0]]', '[-1, 0, 3]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-01' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-01', 3, '([])', '[[]]', '[]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-01' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-01', 4, '([1, 2, 3])', '[[1,2,3]]', '[1, 2, 3]', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-01' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('sort-02', 'insertion-sort', 'sorting', 'Insertion Sort', 'Sort an array using Insertion Sort.', 'Given an integer array `nums`, sort the array in non-decreasing order by inserting each element into its sorted prefix.', 'Medium', 'insertionSort', 'public int[] insertionSort(int[] nums)', '["int[]"]', 'int[]', 'public class Solution {
    public int[] insertionSort(int[] nums) {
        return nums;
    }
}
', 'public class Solution {
    public int[] insertionSort(int[] nums) {
        for (int i = 1; i < nums.length; i++) {
            int key = nums[i];
            int j = i - 1;
            while (j >= 0 && nums[j] > key) {
                nums[j + 1] = nums[j];
                j--;
            }
            nums[j + 1] = key;
        }
        return nums;
    }
}
', 'Shift elements greater than `key` one step right until the insertion position for `key` is found.', '[{"input":"[9, 3, 7, 1]","output":"[1, 3, 7, 9]"},{"input":"[2, 2, 1]","output":"[1, 2, 2]"}]', '["0 <= nums.length <= 2000"]', '["Maintain the invariant that `nums[0..i-1]` is always sorted."]', '["Sorting","Insertion Sort"]', 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-02', 1, '([9, 3, 7, 1])', '[[9,3,7,1]]', '[1, 3, 7, 9]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-02' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-02', 2, '([2, 2, 1])', '[[2,2,1]]', '[1, 2, 2]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-02' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-02', 3, '([42])', '[[42]]', '[42]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-02' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-02', 4, '([5, 4, 3, 2, 1])', '[[5,4,3,2,1]]', '[1, 2, 3, 4, 5]', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-02' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('sort-03', 'sort-colors', 'sorting', 'Sort Colors (0, 1, 2)', 'Sort an array containing only 0s, 1s, and 2s in one pass.', 'Given an array `nums` with integers `0`, `1`, and `2`, sort them in-place so that objects of the same value are adjacent in the order `0`, `1`, `2`, and return the array.', 'Medium', 'sortColors', 'public int[] sortColors(int[] nums)', '["int[]"]', 'int[]', 'public class Solution {
    public int[] sortColors(int[] nums) {
        return nums;
    }
}
', 'public class Solution {
    public int[] sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int t = nums[low]; nums[low++] = nums[mid]; nums[mid++] = t;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int t = nums[mid]; nums[mid] = nums[high]; nums[high--] = t;
            }
        }
        return nums;
    }
}
', 'Dutch National Flag algorithm partitions the array into `[0s | 1s | unknown | 2s]` in a single O(n) pass and O(1) space.', '[{"input":"[2, 0, 2, 1, 1, 0]","output":"[0, 0, 1, 1, 2, 2]"},{"input":"[2, 0, 1]","output":"[0, 1, 2]"}]', '["1 <= nums.length <= 10^4","nums[i] is 0, 1, or 2"]', '["Track three pointers: `low`, `mid`, and `high`."]', '["Sorting","Three Pointers"]', 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-03', 1, '([2, 0, 2, 1, 1, 0])', '[[2,0,2,1,1,0]]', '[0, 0, 1, 1, 2, 2]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-03' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-03', 2, '([2, 0, 1])', '[[2,0,1]]', '[0, 1, 2]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-03' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-03', 3, '([0])', '[[0]]', '[0]', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-03' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-03', 4, '([2, 2, 1, 0, 0])', '[[2,2,1,0,0]]', '[0, 0, 1, 2, 2]', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-03' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('sort-04', 'kth-largest-element', 'sorting', 'Kth Largest Element', 'Find the kth largest element in an unsorted array.', 'Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array (1-indexed from largest).', 'Hard', 'findKthLargest', 'public int findKthLargest(int[] nums, int k)', '["int[]","int"]', 'int', 'public class Solution {
    public int findKthLargest(int[] nums, int k) {
        return 0;
    }
}
', 'import java.util.PriorityQueue;

public class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) {
                minHeap.poll();
            }
        }
        return minHeap.peek();
    }
}
', 'A min-heap of size `k` retains the `k` largest elements seen so far, leaving the `k`th largest at `minHeap.peek()` in O(n log k) time.', '[{"input":"[3, 2, 1, 5, 6, 4], 2","output":"5"},{"input":"[3, 2, 3, 1, 2, 4, 5, 5, 6], 4","output":"4"}]', '["1 <= k <= nums.length <= 10^4"]', '["Keep a `PriorityQueue<Integer>` bounded to size `k`."]', '["Heap","Sorting"]', 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-04', 1, '([3, 2, 1, 5, 6, 4], 2)', '[[3,2,1,5,6,4],2]', '5', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-04' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-04', 2, '([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)', '[[3,2,3,1,2,4,5,5,6],4]', '4', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-04' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-04', 3, '([1], 1)', '[[1],1]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-04' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'sort-04', 4, '([-1, 2, 0], 1)', '[[-1,2,0],1]', '2', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'sort-04' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('search-01', 'binary-search', 'searching', 'Binary Search', 'Find the index of a target value in a sorted array.', 'Given an array of integers `nums` sorted in ascending order and an integer `target`, write a method to search `target` in `nums`. If `target` exists, return its index; otherwise return `-1`.', 'Easy', 'binarySearch', 'public int binarySearch(int[] nums, int target)', '["int[]","int"]', 'int', 'public class Solution {
    public int binarySearch(int[] nums, int target) {
        return -1;
    }
}
', 'public class Solution {
    public int binarySearch(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
}
', 'Use `lo + (hi - lo) / 2` to avoid integer overflow while halving the search interval each iteration in O(log n) time.', '[{"input":"[-1, 0, 3, 5, 9, 12], 9","output":"4"},{"input":"[-1, 0, 3, 5, 9, 12], 2","output":"-1"}]', '["1 <= nums.length <= 10^4","All elements in nums are distinct and sorted ascending"]', '["Halve the range `[lo, hi]` by comparing `nums[mid]` against `target`."]', '["Binary Search"]', 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-01', 1, '([-1, 0, 3, 5, 9, 12], 9)', '[[-1,0,3,5,9,12],9]', '4', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-01' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-01', 2, '([-1, 0, 3, 5, 9, 12], 2)', '[[-1,0,3,5,9,12],2]', '-1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-01' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-01', 3, '([5], 5)', '[[5],5]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-01' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-01', 4, '([1, 3, 5, 7], 1)', '[[1,3,5,7],1]', '0', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-01' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('search-02', 'search-insert-position', 'searching', 'Search Insert Position', 'Find target index or the index where it would be inserted in sorted order.', 'Given a sorted array of distinct integers `nums` and a `target` value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.', 'Easy', 'searchInsert', 'public int searchInsert(int[] nums, int target)', '["int[]","int"]', 'int', 'public class Solution {
    public int searchInsert(int[] nums, int target) {
        return 0;
    }
}
', 'public class Solution {
    public int searchInsert(int[] nums, int target) {
        int lo = 0, hi = nums.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}
', 'Lower-bound binary search converges `lo` onto the first element `>= target`, which equals the insertion index.', '[{"input":"[1, 3, 5, 6], 5","output":"2"},{"input":"[1, 3, 5, 6], 2","output":"1"}]', '["1 <= nums.length <= 10^4","nums is strictly increasing"]', '["When `nums[mid] < target`, move `lo = mid + 1`; otherwise shrink `hi = mid`."]', '["Binary Search","Lower Bound"]', 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-02', 1, '([1, 3, 5, 6], 5)', '[[1,3,5,6],5]', '2', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-02' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-02', 2, '([1, 3, 5, 6], 2)', '[[1,3,5,6],2]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-02' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-02', 3, '([1, 3, 5, 6], 7)', '[[1,3,5,6],7]', '4', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-02' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-02', 4, '([1, 3, 5, 6], 0)', '[[1,3,5,6],0]', '0', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-02' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('search-03', 'first-occurrence-sorted', 'searching', 'First Occurrence in Sorted Array', 'Find the leftmost index of a target with duplicates.', 'Given a non-decreasing array `nums` that may contain duplicate values and an integer `target`, return the smallest index `i` such that `nums[i] == target`, or `-1` if `target` is absent.', 'Medium', 'firstOccurrence', 'public int firstOccurrence(int[] nums, int target)', '["int[]","int"]', 'int', 'public class Solution {
    public int firstOccurrence(int[] nums, int target) {
        return -1;
    }
}
', 'public class Solution {
    public int firstOccurrence(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1, ans = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) {
                ans = mid;
                hi = mid - 1;
            } else if (nums[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return ans;
    }
}
', 'Record `ans = mid` when `nums[mid] == target`, then keep searching the left half `hi = mid - 1` for an earlier match.', '[{"input":"[1, 2, 2, 2, 3], 2","output":"1"},{"input":"[1, 2, 3], 4","output":"-1"}]', '["0 <= nums.length <= 10^4"]', '["Do not return immediately on match; record `ans = mid` and continue leftward."]', '["Binary Search"]', 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-03', 1, '([1, 2, 2, 2, 3], 2)', '[[1,2,2,2,3],2]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-03' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-03', 2, '([1, 2, 3], 4)', '[[1,2,3],4]', '-1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-03' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-03', 3, '([2, 2, 2], 2)', '[[2,2,2],2]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-03' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-03', 4, '([], 1)', '[[],1]', '-1', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-03' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('search-04', 'find-peak-element', 'searching', 'Find Peak Element', 'Find an index whose value is strictly greater than its neighbors.', 'A peak element is an element that is strictly greater than its neighbors (`nums[-1] = nums[n] = -infinity`). Given an integer array `nums` where adjacent elements are distinct, return the index of a peak element.', 'Hard', 'findPeakElement', 'public int findPeakElement(int[] nums)', '["int[]"]', 'int', 'public class Solution {
    public int findPeakElement(int[] nums) {
        return 0;
    }
}
', 'public class Solution {
    public int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < nums[mid + 1]) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }
}
', 'Compare `nums[mid]` with `nums[mid + 1]`: moving toward the rising slope guarantees reaching a local peak in O(log n) time.', '[{"input":"[1, 2, 3, 1]","output":"2"},{"input":"[10, 20, 15]","output":"1"}]', '["1 <= nums.length <= 1000","nums[i] != nums[i + 1] for all valid i"]', '["Follow the upward slope with binary search."]', '["Binary Search"]', 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-04', 1, '([1, 2, 3, 1])', '[[1,2,3,1]]', '2', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-04' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-04', 2, '([10, 20, 15])', '[[10,20,15]]', '1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-04' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-04', 3, '([5])', '[[5]]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-04' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'search-04', 4, '([1, 2, 3, 4, 5])', '[[1,2,3,4,5]]', '4', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'search-04' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('adv-01', 'climbing-stairs', 'advanced', 'Climbing Stairs', 'Count distinct ways to climb n stairs taking 1 or 2 steps.', 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?', 'Easy', 'climbStairs', 'public int climbStairs(int n)', '["int"]', 'int', 'public class Solution {
    public int climbStairs(int n) {
        return 0;
    }
}
', 'public class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}
', 'Ways to reach step `i` equals `ways(i - 1) + ways(i - 2)`, solved iteratively in O(n) time and O(1) space.', '[{"input":"2","output":"2"},{"input":"5","output":"8"}]', '["1 <= n <= 45"]', '["Use iterative dynamic programming with two variables instead of exponential recursion."]', '["Dynamic Programming"]', 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-01', 1, '(2)', '[2]', '2', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-01' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-01', 2, '(3)', '[3]', '3', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-01' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-01', 3, '(5)', '[5]', '8', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-01' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-01', 4, '(10)', '[10]', '89', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-01' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('adv-02', 'valid-parentheses', 'advanced', 'Valid Parentheses', 'Determine whether brackets are balanced and properly nested.', 'Given a string `s` containing just the characters `''(''`, `'')''`, `''{''`, `''}''`, `''[''` and `'']''`, determine if the input string is valid: open brackets must be closed by the same type of brackets in the correct order.', 'Medium', 'isValidParentheses', 'public boolean isValidParentheses(String s)', '["String"]', 'boolean', 'public class Solution {
    public boolean isValidParentheses(String s) {
        return false;
    }
}
', 'import java.util.ArrayDeque;
import java.util.Deque;

public class Solution {
    public boolean isValidParentheses(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == ''('') stack.push('')'');
            else if (c == ''['') stack.push('']'');
            else if (c == ''{'') stack.push(''}'');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}
', 'Push the expected closing bracket for every opening bracket onto an `ArrayDeque` stack and verify exact matches when closing.', '[{"input":"\"()[]{}\"","output":"true"},{"input":"\"([)]\"","output":"false"}]', '["0 <= s.length() <= 10^4"]', '["Check `stack.isEmpty()` before popping and again at the end."]', '["Stack","String"]', 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-02', 1, '("()[]{}")', '["()[]{}"]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-02' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-02', 2, '("([)]")', '["([)]"]', 'false', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-02' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-02', 3, '("{[]}")', '["{[]}"]', 'true', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-02' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-02', 4, '("(")', '["("]', 'false', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-02' AND case_number = 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-02', 5, '("")', '[""]', 'true', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-02' AND case_number = 5);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('adv-03', 'house-robber', 'advanced', 'House Robber', 'Maximize non-adjacent sum along an array of house values.', 'You are a professional robber planning to rob houses along a street. Adjacent houses have security systems connected that trigger an alarm if two adjacent houses are robbed on the same night. Given `nums` representing money at each house, return the maximum amount you can rob without alerting the police.', 'Medium', 'rob', 'public int rob(int[] nums)', '["int[]"]', 'int', 'public class Solution {
    public int rob(int[] nums) {
        return 0;
    }
}
', 'public class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int val : nums) {
            int next = Math.max(prev1, prev2 + val);
            prev2 = prev1;
            prev1 = next;
        }
        return prev1;
    }
}
', 'At each house `val`, choose the maximum between skipping it (`prev1`) and robbing it (`prev2 + val`).', '[{"input":"[1, 2, 3, 1]","output":"4"},{"input":"[2, 7, 9, 3, 1]","output":"12"}]', '["0 <= nums.length <= 1000","0 <= nums[i] <= 400"]', '["Track only the best total up to `i-1` and `i-2`."]', '["Dynamic Programming"]', 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-03', 1, '([1, 2, 3, 1])', '[[1,2,3,1]]', '4', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-03' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-03', 2, '([2, 7, 9, 3, 1])', '[[2,7,9,3,1]]', '12', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-03' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-03', 3, '([5])', '[[5]]', '5', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-03' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-03', 4, '([2, 1, 1, 2])', '[[2,1,1,2]]', '4', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-03' AND case_number = 4);
INSERT OR IGNORE INTO problems (id, slug, category_id, title, summary, description, difficulty, method_name, method_signature, parameter_types_json, return_type, starter_code, solution_code, solution_explanation, examples_json, constraints_json, hints_json, tags_json, sort_order) VALUES ('adv-04', 'coin-change', 'advanced', 'Coin Change (Minimum Coins)', 'Find the fewest coins needed to make up a target amount.', 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins needed to make up that amount, or `-1` if that amount cannot be made up.', 'Hard', 'coinChange', 'public int coinChange(int[] coins, int amount)', '["int[]","int"]', 'int', 'public class Solution {
    public int coinChange(int[] coins, int amount) {
        return -1;
    }
}
', 'import java.util.Arrays;

public class Solution {
    public int coinChange(int[] coins, int amount) {
        int max = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, max);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a) {
                    dp[a] = Math.min(dp[a], dp[a - c] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}
', 'Bottom-up DP table `dp[a]` stores the minimum coins required for amount `a`, initialized to `amount + 1` as infinity.', '[{"input":"[1, 2, 5], 11","output":"3"},{"input":"[2], 3","output":"-1"}]', '["1 <= coins.length <= 12","0 <= amount <= 10^4"]', '["Initialize `dp[0] = 0` and compute `dp[a] = min(dp[a], dp[a - coin] + 1)`."]', '["Dynamic Programming","DP"]', 4);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-04', 1, '([1, 2, 5], 11)', '[[1,2,5],11]', '3', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-04' AND case_number = 1);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-04', 2, '([2], 3)', '[[2],3]', '-1', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-04' AND case_number = 2);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-04', 3, '([1], 0)', '[[1],0]', '0', 0 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-04' AND case_number = 3);
INSERT INTO test_cases (problem_id, case_number, display_input, input_args_json, expected_output, is_hidden) SELECT 'adv-04', 4, '([1, 3, 4], 6)', '[[1,3,4],6]', '2', 1 WHERE NOT EXISTS (SELECT 1 FROM test_cases WHERE problem_id = 'adv-04' AND case_number = 4);
