import {
    AuthenticationType,
    ControlPosition,
    HtmlMarker,
    control,
    Map as AzureMap
} from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import cn from 'classnames';
import { resolve } from 'inversify-react';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { GeoAddress, Item } from '../../../../../../models/item';
import { TYPES } from '../../../../../../types';
import { AuthenticationService } from '../../../../../../utility-services';
import { Configuration } from '../../../../../../utility-services/configuration';
import './map.scss';

export interface MapMarker {
    geoAddress: GeoAddress,
    icon: any,
    IconComponent: React.ElementType
}

const CN = 'order-details-map';
export interface MapComponentProps {
    className?: string;
    item: Item;
    markers: MapMarker[]
}

interface MapComponentState {
    map: AzureMap;
}

@observer
export class Map extends Component<MapComponentProps, MapComponentState> {
    @resolve(TYPES.CONFIGURATION)
    private config!: Configuration;

    @resolve(TYPES.AUTHENTICATION)
    private authService!: AuthenticationService;

    private map?: AzureMap;

    componentDidMount() {
        const { markers } = this.props;
        const mapInstance = this.buildMap();
        const mapHtmlMarkers = this.mapMarkers(markers);

        mapInstance.events.add('ready', () => {
            mapInstance.markers.add(mapHtmlMarkers);
            mapInstance.controls.add([
                new control.ZoomControl()
            ], {
                position: ControlPosition.TopRight
            });
        });

        this.map = mapInstance;
    }

    componentDidUpdate(prevProps: MapComponentProps) {
        const { markers } = this.props;
        const newMarkers = this.mapMarkers(markers);

        if (this.map) {
            this.map.markers.remove(this.mapMarkers(prevProps.markers));
            this.map.markers.add(newMarkers);
        }
    }

    private get mapId() {
        const { item } = this.props;

        return `${item.id}--map`;
    }

    private mapMarkers(markers: MapMarker[]): HtmlMarker[] {
        return markers
            .filter(mark => mark.geoAddress.isPointable)
            .map(mark => new HtmlMarker({
                htmlContent: mark.icon,
                position: mark.geoAddress.position
            }));
    }

    buildMap() {
        const { maps } = this.config;
        const { clientId } = maps;

        return new AzureMap(this.mapId, {
            center: [-20, 30],
            zoom: 1,
            language: 'en-US',
            view: 'Auto',
            dragRotateInteraction: false,
            authOptions: {
                authType: AuthenticationType.anonymous,
                clientId,
                getToken: (success, error) => {
                    this.authService
                        .getAtlasAccessToken()
                        .then(accessToken => {
                            success(accessToken);
                        })
                        .catch(() => {
                            error('Access token is expired or user is not authorized');
                        });
                }
            }
        });
    }

    render() {
        const { className } = this.props;

        return (
            <div
                className={cn(CN, className)}
                id={this.mapId}
            />
        );
    }
}
