import React from 'react';
import { Tag } from './types';
import TagPreviewRow from './TagPreviewRow';

interface TagListProps {
  tags: Tag[];
  onRemoveTag: (tagId: string) => void;
  onDuplicateTag: (tagId: string) => void;
  onUpdateTag: (tagId: string, newTagData: Partial<Tag>) => void;
}

const TagList: React.FC<TagListProps> = ({ tags, onRemoveTag, onDuplicateTag, onUpdateTag }) => {
  return (
    <div>
      {tags.map(tag => (
        <TagPreviewRow
          key={tag.id}
          tag={tag}
          onRemove={onRemoveTag}
          onDuplicate={onDuplicateTag}
          onUpdate={onUpdateTag}
        />
      ))}
    </div>
  );
};

export default TagList;
