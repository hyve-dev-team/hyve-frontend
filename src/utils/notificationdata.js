
// `link` points at a real route in the app so clicking a notification can
// actually navigate somewhere relevant, instead of doing nothing.
const notificationData = [
    {
        id: 1,
        title: "Your booking at Cozy Self-Contained Studio has been confirmed.",
        date: "March 1, 2023",
        link: "/user/apartment/manage",
    },
    {
        id: 2,
        title: "You have a new message from your landlord.",
        date: "February 26, 2023",
        link: "/user/chats",
    },
    {
        id: 3,
        title: "Price dropped on Modern 3 Bedroom Duplex, one of your saved apartments.",
        date: "April 25, 2022",
        link: "/user/apartment/saved",
    },
    {
        id: 4,
        title: "Payment reminder: your rent renewal is due soon.",
        date: "March 6, 2022",
        link: "/user/apartment/manage",
    },
    {
        id: 5,
        title: "Your profile verification was approved.",
        date: "March 1, 2022",
        link: "/user/profile",
    },
];

export default notificationData
