export function members(app){
    app.get("/api/members")
    app.get("/api/members/:id")
    app.post("/api/members/:id/pubgId")
    app.get("/api/members/sycoClan")
    app.get("/api/members/sycoActive")
}

export function getMembers(req: any, res: any) {

}

export function getSycoActive(req: any, res: any) {

}

export function getSycoClanMembers(req: any, res: any) {

}

export function getMemberFull(req: any, res: any) {

}

export function updatePubgId(req: any, res: any) {

}