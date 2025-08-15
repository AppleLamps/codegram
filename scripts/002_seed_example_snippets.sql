-- Insert example users first
INSERT INTO "User" (id, username, email, name, bio, "createdAt", "updatedAt") VALUES
('user1', 'sarah_dev', 'sarah@example.com', 'Sarah Chen', 'Full-stack developer who loves clean code', NOW(), NOW()),
('user2', 'alex_codes', 'alex@example.com', 'Alex Rodriguez', 'React enthusiast and UI/UX designer', NOW(), NOW()),
('user3', 'mike_python', 'mike@example.com', 'Mike Johnson', 'Python developer and data scientist', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert example snippets
INSERT INTO "Snippet" (id, title, description, code, language, "authorId", "isPublic", "createdAt", "updatedAt") VALUES
('snippet1', 'React Custom Hook for API Calls', 'A reusable custom hook for handling API requests with loading states and error handling', 
'import { useState, useEffect } from ''react'';

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error(''Failed to fetch'');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : ''Unknown error'');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}', 
'typescript', 'user1', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

('snippet2', 'CSS Grid Card Layout', 'Responsive card layout using CSS Grid with auto-fit and minmax for perfect responsiveness',
'.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.card p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}',
'css', 'user2', true, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),

('snippet3', 'Python Data Validator', 'Clean data validation utility with type checking and custom error messages',
'from typing import Any, Dict, List, Optional, Union
import re

class DataValidator:
    def __init__(self):
        self.errors: List[str] = []
    
    def validate_email(self, email: str) -> bool:
        pattern = r''^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$''
        if not re.match(pattern, email):
            self.errors.append(f"Invalid email format: {email}")
            return False
        return True
    
    def validate_required(self, data: Dict[str, Any], fields: List[str]) -> bool:
        missing = [field for field in fields if field not in data or not data[field]]
        if missing:
            self.errors.append(f"Missing required fields: {', '.join(missing)}")
            return False
        return True
    
    def validate_length(self, value: str, min_len: int, max_len: int, field_name: str) -> bool:
        if not (min_len <= len(value) <= max_len):
            self.errors.append(f"{field_name} must be between {min_len} and {max_len} characters")
            return False
        return True
    
    def is_valid(self) -> bool:
        return len(self.errors) == 0
    
    def get_errors(self) -> List[str]:
        return self.errors.copy()

# Usage example
validator = DataValidator()
user_data = {"email": "user@example.com", "username": "john_doe"}

validator.validate_required(user_data, ["email", "username"])
validator.validate_email(user_data["email"])
validator.validate_length(user_data["username"], 3, 20, "Username")

if validator.is_valid():
    print("Data is valid!")
else:
    print("Validation errors:", validator.get_errors())',
'python', 'user3', true, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert some tags
INSERT INTO "Tag" (id, name, "createdAt", "updatedAt") VALUES
('tag1', 'react', NOW(), NOW()),
('tag2', 'typescript', NOW(), NOW()),
('tag3', 'css', NOW(), NOW()),
('tag4', 'grid', NOW(), NOW()),
('tag5', 'python', NOW(), NOW()),
('tag6', 'validation', NOW(), NOW()),
('tag7', 'hooks', NOW(), NOW()),
('tag8', 'responsive', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Link snippets to tags
INSERT INTO "SnippetTag" ("snippetId", "tagId") VALUES
('snippet1', 'tag1'),
('snippet1', 'tag2'),
('snippet1', 'tag7'),
('snippet2', 'tag3'),
('snippet2', 'tag4'),
('snippet2', 'tag8'),
('snippet3', 'tag5'),
('snippet3', 'tag6')
ON CONFLICT ("snippetId", "tagId") DO NOTHING;

-- Add some likes to make it look active
INSERT INTO "Like" (id, "userId", "snippetId", "createdAt") VALUES
('like1', 'user2', 'snippet1', NOW() - INTERVAL '1 hour'),
('like2', 'user3', 'snippet1', NOW() - INTERVAL '30 minutes'),
('like3', 'user1', 'snippet2', NOW() - INTERVAL '3 hours'),
('like4', 'user3', 'snippet2', NOW() - INTERVAL '2 hours'),
('like5', 'user1', 'snippet3', NOW() - INTERVAL '5 hours'),
('like6', 'user2', 'snippet3', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;
