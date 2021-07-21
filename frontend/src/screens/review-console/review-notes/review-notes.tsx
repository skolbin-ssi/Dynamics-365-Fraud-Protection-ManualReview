// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import './review-notes.scss';

import cn from 'classnames';
import React, { FC } from 'react';

import { Persona, PersonaSize } from '@fluentui/react/lib/Persona';
import { Text } from '@fluentui/react/lib/Text';

import { Note } from '../../../models';
import { formatForNotes } from '../../../utils/date';

interface ReviewNotesProps {
    className?: string;
    notes: Note[];
}

const CN = 'review-notes';

export const ReviewNotes: FC<ReviewNotesProps> = (props: ReviewNotesProps) => {
    const { className, notes } = props;

    return (
        <ul className={cn(className, CN)}>
            {
                notes.map((note: Note, i) => {
                    const { note: content, user, created } = note;
                    const formattedDate = formatForNotes(created, '');
                    const name = user ? user.name : 'Fraud Analyst';

                    return (
                        // TODO: don't use index as key (so far we don't have unique params in dummy data)
                        // eslint-disable-next-line react/no-array-index-key
                        <li className={`${CN}__note`} key={`${created}-note-${i}`}>
                            <div className={`${CN}__note-heading`}>
                                <Persona
                                    imageUrl={user?.imageUrl}
                                    hidePersonaDetails
                                    size={PersonaSize.size32}
                                    className={`${CN}__note-photo`}
                                    text={user?.name}
                                />
                                <Text className={`${CN}__note-name`}>{name}</Text>
                                <Text variant="small">{formattedDate}</Text>
                            </div>
                            <div className={`${CN}__note-content`}>
                                <Text variant="small">
                                    <pre>
                                        { content }
                                    </pre>
                                </Text>
                            </div>
                        </li>
                    );
                })
            }
        </ul>
    );
};

ReviewNotes.defaultProps = { className: '' };
