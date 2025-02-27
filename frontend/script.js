document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a PDF file.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        const fileContent = event.target.result;
        uploadPdf(file);
    };

    reader.readAsArrayBuffer(file);
});

function uploadPdf(file) {
    const bucket = 'examtricz-pdf-uploads-clintonfourie'; // Replace with your bucket name
    const key = file.name;

    // Initialize Cognito Credentials
    AWS.config.region = 'eu-west-1'; // Replace with your region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'eu-west-1:bdd62d66-d4fb-4621-ba95-96f3f4808042' // Replace with your Identity Pool ID
    });

    // Upload the file to S3
    const s3 = new AWS.S3();

    const params = {
        Bucket: bucket,
        Key: key,
        Body: file,
    };

    s3.upload(params, function(err, data) {
        if (err) {
            console.error('Error uploading to S3:', err);
            alert('Error uploading PDF.');
            return;
        }

        console.log('File uploaded to S3:', data.Location);

        // Call your API Gateway endpoint
        const apiUrl = 'https://ys5x11hmfj.execute-api.eu-west-1.amazonaws.com/dev/pdf-processor'; // Replace with your API Gateway URL

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                body: JSON.stringify({
                    bucket: bucket,
                    key: key
                })
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.statusCode === 200) {
                const extractedText = JSON.parse(data.body).extractedText;
                document.getElementById('result').textContent = extractedText;
            } else {
                alert('Error processing PDF.');
                console.error('API Error:', data);
            }
        })
        .catch(error => {
            alert('Network error.');
            console.error('Fetch Error:', error);
        });
    });
}