import RedStone from "../RedStone";


export default new class ActorManager {
    reset() {

        this.focusActor = 0xffff;

        this.actorCount = 0;

        RedStone.actors.forEach(actor => actor.reset());

    }

    close() {
        this.reset();
    }

    update(delta) {
        //

        RedStone.actors.forEach(actor => {
            //

            actor.update(delta);
        });
    }

    getTestedActor(serial, isAddValidActorList = true) {
        if (serial < 0 || serial >= MAX_ACTOR) return null;

        if (RedStone.actors[serial].serial === 0xffff/*  || RedStone.actors[serial].syncStatusWithServer === SSWS_VALID_ACTOR */) {
            if (isAddValidActorList) {
                // this.addObscurityActor(serial);
            }
            return null;
        }

        return RedStone.actors[serial];
    }
}