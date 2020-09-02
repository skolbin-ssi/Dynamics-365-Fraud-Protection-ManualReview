import { IFacepilePersona } from '@fluentui/react/lib/Facepile';
import { IPersonaProps } from '@fluentui/react/lib/Persona';
import { action, computed, observable } from 'mobx';
import { ROLE } from '../../constants';

export class User {
    id: string = '';

    @observable
    name: string = '';

    email?: string;

    roles: ROLE[] = [];

    upn?: string;

    @observable
    imageUrl?: string;

    constructor(id: string, name: string, roles: ROLE[], mail: string | undefined = undefined, userPrincipalName?: string, imageUrl?: string) {
        this.id = id;
        this.name = name;
        this.roles = roles;
        this.email = mail;
        this.upn = userPrincipalName;
        this.imageUrl = imageUrl;
    }

    @action
    setImageUrl(imageUrl?: string) {
        if (imageUrl) {
            this.imageUrl = imageUrl;
        }
    }

    @computed
    get asFacepilePersona(): IFacepilePersona {
        return {
            personaName: this.name,
            imageUrl: this.imageUrl
        };
    }

    @computed
    get asPersona(): IPersonaProps {
        return {
            id: this.id,
            text: this.name,
            secondaryText: this.email ? this.email : `UPN: ${this.upn}`,
            showSecondaryText: !!this.upn,
            imageUrl: this.imageUrl
        };
    }
}
