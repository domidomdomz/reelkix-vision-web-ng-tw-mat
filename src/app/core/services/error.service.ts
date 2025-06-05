import { Injectable } from "@angular/core";
import { ProblemDetails } from "../interfaces/problem-details.interface";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({ providedIn: 'root' })
export class ErrorService {
    constructor(private snackBar: MatSnackBar) {}

    handleProblemDetails(problemDetails: ProblemDetails): void {
        const message = problemDetails.title
            ? `${problemDetails.title}: ${problemDetails.detail}`
            : problemDetails.detail;

        this.showError(message);
        console.error('ProblemDetails:', problemDetails);
    }

    showError(message: string | undefined): void {
        this.snackBar.open(
            `${message}`,
            'Dismiss', 
            {
                duration: 5000,
                panelClass: ['custom-error-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'top', // More noticeable than bottom
                data: {
                icon: 'error' // Material icon name
                }
            }
        );
    }

}