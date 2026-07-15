import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange }) => {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
      <Search size={16} className="text-primary" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-none bg-transparent text-text-primary outline-none"
        placeholder="Search tasks"
      />
    </label>
  );
};

export default SearchBar;
