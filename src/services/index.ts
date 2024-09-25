import { EventService } from "./components/eventService";
import { GuestService } from "./components/guestService";

const baseUrl = process.env.VUE_APP_API_BASEADDRESS

const eventService = new EventService(`${baseUrl}/event`);
const guestService = new GuestService(`${baseUrl}/guest`);

export {
    eventService,
    guestService
}