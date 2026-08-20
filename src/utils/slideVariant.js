 const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '30%' : '-30%', // Slide in from the right (100%) if forward (dir > 0), or from left (-100%) if backward
            opacity: 0,
        }),
        center: {
            x: 0, // In the middle of the screen
            opacity: 1,
            transition: {
                duration: 0.3,
            },
        },
        exit: (direction) => ({
            x: direction < 0 ? '30%' : '-30%', // Slide out to the right (100%) if backward (dir < 0), or to the left (-100%) if forward
            opacity: 0,
            transition: {
                duration: 0.3,
            },
        }),
    };

    export default slideVariants