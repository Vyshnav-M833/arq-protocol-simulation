document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("arqCanvas");
    const ctx = canvas.getContext("2d");

    const totalFrames = parseInt(prompt("Enter the number of frames to send: "));
    const lostFrame = parseInt(prompt("Enter the frame to be lost: "));
    const choice = parseInt(prompt("Choose the ARQ: 1 for Stop-and-Wait, 2 for Go-Back-N, 3 for Selective Repeat"));

    const frameSize = 50; // Fixed frame size
    const verticalSpacing = frameSize + 40;
    const canvasHeight = 100 + (totalFrames * verticalSpacing);
    canvas.height = canvasHeight > 1000 ? canvasHeight : 1000;

    ctx.font = "16px Arial";

    let subheading = '';
    switch (choice) {
        case 1:
            subheading = "Stop-and-Wait ARQ";
            break;
        case 2:
            subheading = "Go-Back-N ARQ";
            break;
        case 3:
            subheading = "Selective Repeat ARQ";
            break;
        default:
            alert("Invalid choice! Please refresh and enter 1, 2, or 3.");
            return;
    }
    
    ctx.fillText(subheading, 400, 30); // Subheading for ARQ

    ctx.fillText("Sender", 150, 60);
    ctx.fillText("Receiver", 850, 60);

    // Draw vertical lines for sender and receiver
    ctx.beginPath();
    ctx.moveTo(150, 70);
    ctx.lineTo(150, canvas.height - 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(850, 70);
    ctx.lineTo(850, canvas.height - 40);
    ctx.stroke();

    const drawFrame = (frame, y, sender, isLost) => {
        const x = sender ? 100 : 800;
        ctx.fillStyle = isLost ? "red" : "green";
        ctx.fillRect(x, y, frameSize, frameSize);
        ctx.strokeRect(x, y, frameSize, frameSize);
        ctx.fillStyle = "black";
        ctx.fillText(`Frame ${frame}`, x + (frameSize / 4), y + frameSize / 2);
    };

    const drawLine = (startX, startY, endX, endY, color) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    };

    let totalAcks = 0;
    let totalNacks = 0;
    let discardedFrames = 0;

    switch (choice) {
        case 1:
            // Stop-and-Wait ARQ
            for (let i = 0; i < totalFrames; i++) {
                const y = 100 + (i * verticalSpacing);
                drawFrame(i, y, true, i === lostFrame);
                drawLine(150, y + frameSize / 2, 850, y + frameSize / 2, "black");

                if (i === lostFrame) {
                    ctx.fillText("Frame Lost", 450, y + frameSize / 2);
                    drawFrame(i, y, false, true);
                    discardedFrames++;
                    ctx.fillText(`Frame ${i} not acknowledged. Resending...`, 300, y + frameSize + 40);
                } else {
                    drawFrame(i, y, false, false);
                    drawLine(850, y + frameSize / 2, 150, y + frameSize + 40, "blue");
                    ctx.fillText(`ACK ${i}`, 400, y + frameSize + 40);
                    totalAcks++;
                }
            }
            break;
        case 2:
            // Go-Back-N ARQ
            const frameWindow = parseInt(prompt("Enter the frame window size: "));
            for (let i = 0; i < totalFrames;) {
                const windowEnd = Math.min(i + frameWindow, totalFrames);
                let transmissionSuccessful = true;
                let y = 100 + (i * verticalSpacing); // Initial vertical position

                for (let j = i; j < windowEnd; j++) {
                    drawFrame(j, y, true, j === lostFrame);
                    drawLine(150, y + frameSize / 2, 850, y + frameSize / 2, "black");

                    if (j === lostFrame) {
                        ctx.fillText("Frame Lost", 450, y + frameSize / 2);
                        transmissionSuccessful = false;
                        discardedFrames++;
                        break;
                    } else {
                        drawFrame(j, y, false, false);
                        drawLine(850, y + frameSize / 2, 150, y + frameSize + 40, "blue");
                        ctx.fillText(`ACK ${j}`, 400, y + frameSize + 40);
                        totalAcks++;
                        y += verticalSpacing; // Update vertical position for next frame
                    }
                }

                if (!transmissionSuccessful) {
                    y += verticalSpacing; // Move down for retransmission
                }
                i += windowEnd - i; // Move window
            }
            break;
        case 3:
            // Selective Repeat ARQ
            const received = new Array(totalFrames).fill(false);

            for (let i = 0; i < totalFrames; i++) {
                const y = 100 + (i * verticalSpacing);
                drawFrame(i, y, true, i === lostFrame);
                drawLine(150, y + frameSize / 2, 850, y + frameSize / 2, "black");

                if (i === lostFrame) {
                    ctx.fillText("Frame Lost", 450, y + frameSize / 2);
                    discardedFrames++;
                } else {
                    drawFrame(i, y, false, false);
                    drawLine(850, y + frameSize / 2, 150, y + frameSize + 40, "blue");
                    ctx.fillText(`ACK ${i}`, 400, y + frameSize + 40);
                    received[i] = true;
                    totalAcks++;
                }
            }

            // Retransmit lost frames
            for (let i = 0; i < totalFrames; i++) {
                if (!received[i]) {
                    const y = 100 + (i * verticalSpacing) + 40; // Adjust y-coordinate for retransmission
                    drawFrame(i, y, true, true);
                    drawLine(150, y + frameSize / 2, 850, y + frameSize / 2, "red");
                    drawFrame(i, y + 40, false, false); // Acknowledge the retransmission below the original frame
                    drawLine(850, y + 40 + frameSize / 2, 150, y + 80 + frameSize, "blue");
                    ctx.fillText(`NACK ${i}`, 400, y + frameSize / 2);
                    ctx.fillText(`Retransmit Frame ${i}`, 300, y + 40 + frameSize + 40);
                    ctx.fillText(`ACK ${i}`, 400, y + 80 + frameSize + 40);
                    totalNacks++;
                }
            }
            break;
    }

    const outputMetrics = document.getElementById("outputMetrics");
    outputMetrics.innerHTML = `
        <p>Total number of frames: ${totalFrames}</p>
        <p>Total number of ACKs: ${totalAcks}</p>
        <p>Total number of discarded frames: ${discardedFrames}</p>
        ${choice === 3 ? `<p>Total number of NACKs: ${totalNacks}</p>` : ""}
    `;
});
