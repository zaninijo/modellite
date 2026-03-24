import React, { useEffect, useRef } from 'react';
import { Tag } from './types';
import type { TagValuesBase } from './types';
import { flattenObject } from './utils';


interface TagProps {
    tag: Tag;
    onUpdate?: (newValues: TagValuesBase) => void;
    isEditable?: boolean;
}

const TagComponent: React.FC<TagProps> = ({ tag, onUpdate, isEditable }) => {
    const tagRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const styleId = tag.template.templateName;
        let styleEl = document.getElementById(styleId) as HTMLStyleElement;

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = tag.template.templateStyle;
            document.head.appendChild(styleEl);
        }

        return () => {
            
        };
    }, [tag.template.templateName, tag.template.templateStyle]);

    useEffect(() => {
        if (!isEditable || !onUpdate || !tagRef.current) return;

        const handleInput = (event: Event) => {
            const target = event.target as HTMLElement;
            const id = target.id;
            const newValue = target.textContent || '';
            
            const newValues = JSON.parse(JSON.stringify(tag.values));

            const keys = id.split('.');
            let current = newValues;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = newValue;
            
            onUpdate(newValues);
        };

        const elements = tagRef.current.querySelectorAll('[id]');
        elements.forEach(element => {
            if (tag.template.tagOutputs.includes(element.id)) {
                (element as HTMLElement).contentEditable = 'true';
                element.addEventListener('input', handleInput);
            }
        });

        return () => {
            elements.forEach(element => {
                if (tag.template.tagOutputs.includes(element.id)) {
                    (element as HTMLElement).contentEditable = 'false';
                    element.removeEventListener('input', handleInput);
                }
            });
        };
    }, [isEditable, onUpdate, tag.values, tag.template.tagOutputs]);

    const getHtml = () => {
        const tempDiv = document.createElement('div');
        const templateClone = tag.template.templateElement.cloneNode(true) as DocumentFragment;

        const flattenedValues = flattenObject(tag.values);

        Object.entries(flattenedValues).forEach(([key, value]) => {
            const tagOutput = templateClone.getElementById(key);
            if (tagOutput) {
                tagOutput.textContent = value || '';
            }
        });

        tempDiv.appendChild(templateClone);
        return tempDiv.innerHTML;
    };

    return <div ref={tagRef} dangerouslySetInnerHTML={{ __html: getHtml() }} />;
};

export default TagComponent;
