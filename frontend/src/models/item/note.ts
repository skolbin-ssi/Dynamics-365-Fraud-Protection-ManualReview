import { ItemNoteDTO } from '../../data-services/api-services/models/item-note-dto';
import { User } from '../user';

export class Note {
    note: string = '';

    userId: string = '';

    user: User | null = null;

    created: string | null = null;

    setUser(user: User) {
        this.user = user;
    }

    fromDTO(noteDTO: ItemNoteDTO) {
        const { note, userId, created } = noteDTO;

        this.note = note;
        this.userId = userId;
        this.created = created;

        return this;
    }
}
