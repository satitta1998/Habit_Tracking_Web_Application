/**
 * HabitDay Component
 * This component represents a single day in the habit tracker view.
 * It displays day title and a ciruclar button with the day number.
 * The button background color changes based on the active state.
 */

import React from 'react';

// Define the HabitDay component that represents a single day in a habit tracker
const HabitDay = ({day, color, active,switchActive}) => {

    return (
        <div className="flex flex-col items-center text-lg">
            <h4 className="text-gray-400 dark:text-sky-100 mt-5 mb-2">{day?.title}</h4>
            <button
                onClick={switchActive}
                className={`rounded-full w-10 h-10 font-bold ${active ? 'text-white dark:text-white' : 'text-black dark:text-white'}`}
                style={active ? {background: color} : {}}
            >
                {day?.date}
            </button>
        </div>
    );
};

export default HabitDay;