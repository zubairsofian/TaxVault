import { Receipt } from '../types';

const GAS_URL = "https://script.google.com/macros/s/AKfycbxAe3wdAaJM0vMDBf9AYzowbNrPHr-pG5pRSK7rJE-3hTPj9L0eoi6pP_fWR6rOs53S/exec";

export const syncToGAS = async (receipt: Receipt) => {
    try {
        const formData = new FormData();
        formData.append('title', receipt.title);
        formData.append('amount', receipt.amount.toString());
        formData.append('date', receipt.date);
        formData.append('category', receipt.category);
        if (receipt.image) formData.append('image', receipt.image);

        // mode no-cors for apps script usually returns opaque response without error
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });

        return true;
    } catch (error) {
        console.error("Error syncing to GAS:", error);
        return false;
    }
}
