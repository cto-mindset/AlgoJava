use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_schema",
            sql: include_str!("../../migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "seed_problem_catalog",
            sql: include_str!("../../migrations/002_seed_catalog.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn migrations_are_strictly_ordered_and_non_empty() {
        let migrations = get_migrations();
        assert_eq!(migrations.len(), 2);

        let mut prev_version = 0;
        for m in &migrations {
            assert!(m.version > prev_version);
            assert!(!m.description.trim().is_empty());
            assert!(!m.sql.trim().is_empty());
            assert!(
                !m.sql.contains('\r'),
                "Migration {} ({}) must use LF line endings to keep sqlx checksums identical across OSes",
                m.version,
                m.description
            );
            assert!(matches!(m.kind, MigrationKind::Up));
            prev_version = m.version;
        }
    }
}
