import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const handlers = [
    http.post("http://localhost:8080/category", async ({ request }) => {
        if (!request.headers.get("Authorization")) return new HttpResponse(null, { status: 401, statusText: "Access token required." });

        const newCategory = await request.json();

        return HttpResponse.json(newCategory);
    }),

    http.post("http://localhost:8080/feature", async ({ request }) => {
        if (!request.headers.get("Authorization")) return new HttpResponse(null, { status: 401, statusText: "Access token required." });

        const newFeature = await request.json();

        return HttpResponse.json(newFeature);
    }),
    
    http.post("http://localhost:8080/symptom", async ({ request }) => {
        if (!request.headers.get("Authorization")) return new HttpResponse(null, { status: 401, statusText: "Access token required." });

        const newSymptom = await request.json();

        return HttpResponse.json(newSymptom);
    })
];

const server = setupServer(...handlers);
export default server;

