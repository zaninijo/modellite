import { useState } from 'react';
import { Tag } from './types';
import tagTemplate from './tags-models/tagv1';
import TagList from './TagList';
import PrintButton from './PrintButton';

function App() {
  const [tags, setTags] = useState<Tag[]>([]);

  const addTag = () => {
    const newTag = new Tag({
      template: tagTemplate,
      amount: 1,
    }, `tag-${Date.now()}`);
    setTags(prevTags => [...prevTags, newTag]);
  };

  const removeTag = (tagId: string) => {
    setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
  };

  const duplicateTag = (tagId: string) => {
    const tagToDuplicate = tags.find(tag => tag.id === tagId);
    if (tagToDuplicate) {
      const newTag = new Tag({
        ...tagToDuplicate,
        template: tagTemplate,
      }, `tag-${Date.now()}`);
      const index = tags.findIndex(tag => tag.id === tagId);
      const newTags = [...tags];
      newTags.splice(index + 1, 0, newTag);
      setTags(newTags);
    }
  };

  const updateTag = (tagId: string, newTagData: Partial<Tag>) => {
    setTags(prevTags => prevTags.map(tag => {
      if (tag.id === tagId) {
        return { ...tag, ...newTagData };
      }
      return tag;
    }));
  };

  return (
    <div>
      <button onClick={addTag}>Add Tag</button>
      <PrintButton tags={tags} />
      <TagList
        tags={tags}
        onRemoveTag={removeTag}
        onDuplicateTag={duplicateTag}
        onUpdateTag={updateTag}
      />
    </div>
  );
}

export default App;
