import React, { useState } from 'react';
import { Tag } from './types';
import type { TagValuesBase } from './types';
import TagComponent from './Tag';

interface TagPreviewRowProps {
    tag: Tag;
    onRemove: (tagId: string) => void;
    onDuplicate: (tagId: string) => void;
    onUpdate: (tagId: string, newTagData: Partial<Tag>) => void;
}

const TagPreviewRow: React.FC<TagPreviewRowProps> = ({ tag, onRemove, onDuplicate, onUpdate }) => {
    const [amount, setAmount] = useState(tag.amount);
    const [isEditing, setIsEditing] = useState(false);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = parseInt(e.target.value, 10);
        setAmount(newAmount);
        onUpdate(tag.id, { amount: newAmount });
    };

    const handleValuesChange = (newValues: TagValuesBase) => {
        onUpdate(tag.id, { values: newValues });
    };

    return (
        <div className="tag-preview-row">
            <div className="tag-preview">
                <TagComponent 
                    tag={tag} 
                    onUpdate={handleValuesChange}
                    isEditable={isEditing}
                />
            </div>
            <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                min="1"
            />
            <label>
                <input
                    type="checkbox"
                    checked={isEditing}
                    onChange={() => setIsEditing(!isEditing)}
                />
                Edit
            </label>
            <button onClick={() => onDuplicate(tag.id)}>Duplicate</button>
            <button onClick={() => onRemove(tag.id)}>Remove</button>
        </div>
    );
};

export default TagPreviewRow;
