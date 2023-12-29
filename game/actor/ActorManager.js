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
}