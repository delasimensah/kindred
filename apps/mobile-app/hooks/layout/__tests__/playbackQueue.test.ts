import {
  appendTrack,
  cycleRepeat,
  emptyQueue,
  insertNext,
  moveUpcoming,
  removeUpcoming,
  replaceQueue,
  setShuffle,
  stepNext,
  stepPrevious,
  upcomingIndexes,
} from "../playbackQueue";

const asase = {
  trackId: "asase",
  title: "Asase",
  artistName: "Amaara Mensah",
  locked: false,
};
const harmattan = {
  trackId: "harmattan",
  title: "Harmattan Nights",
  artistName: "Kweku Darko",
  locked: false,
};
const locked = {
  trackId: "night",
  title: "Night Mix",
  artistName: "Kweku Darko",
  locked: true,
};
const coastline = {
  trackId: "coast",
  title: "Coastline",
  artistName: "Sela Okoro",
  locked: false,
};

describe("playbackQueue", () => {
  it("starts at the chosen track and skips a locked one on next", () => {
    const queue = replaceQueue(
      [asase, locked, coastline],
      asase.trackId,
      emptyQueue()
    );
    expect(queue.tracks[queue.index]?.title).toBe("Asase");

    const stepped = stepNext(queue);
    expect(stepped.action).toBe("play");
    if (stepped.action === "play") {
      expect(stepped.queue.tracks[stepped.queue.index]?.title).toBe(
        "Coastline"
      );
    }
  });

  it("stops at the end when repeat is off, and wraps on repeat all", () => {
    const queue = replaceQueue([asase, coastline], asase.trackId, emptyQueue());
    const end = stepNext(stepNext(queue).queue);
    expect(end.action).toBe("stop");

    const wrapped = stepNext(stepNext({ ...queue, repeat: "all" }).queue);
    expect(wrapped.action).toBe("play");
    if (wrapped.action === "play") {
      expect(wrapped.queue.tracks[wrapped.queue.index]?.title).toBe("Asase");
    }
  });

  it("replays the current track when repeat is one", () => {
    const queue = replaceQueue([asase, coastline], asase.trackId, {
      shuffle: false,
      repeat: "one",
    });
    expect(stepNext(queue).action).toBe("replay");
  });

  it("inserts play-next after the current track and appends add-to-queue", () => {
    const queue = replaceQueue([asase, coastline], asase.trackId, emptyQueue());
    const withNext = insertNext(queue, harmattan);
    expect(
      upcomingIndexes(withNext).map((index) => withNext.tracks[index]?.title)
    ).toEqual(["Harmattan Nights", "Coastline"]);
    const withAdded = appendTrack(queue, harmattan);
    expect(withAdded.tracks.map((track) => track.title)).toEqual([
      "Asase",
      "Coastline",
      "Harmattan Nights",
    ]);
  });

  it("reorders and removes only upcoming tracks", () => {
    const queue = replaceQueue(
      [asase, harmattan, coastline],
      asase.trackId,
      emptyQueue()
    );
    const moved = moveUpcoming(queue, 0, 1);
    expect(
      upcomingIndexes(moved).map((index) => moved.tracks[index]?.title)
    ).toEqual(["Coastline", "Harmattan Nights"]);
    const removed = removeUpcoming(queue, 0);
    expect(removed.tracks.map((track) => track.title)).toEqual([
      "Asase",
      "Coastline",
    ]);
    expect(stepPrevious(queue).index).toBe(queue.index);
  });

  it("cycles repeat and keeps the current track first when shuffle turns on", () => {
    const queue = replaceQueue(
      [asase, harmattan, coastline],
      harmattan.trackId,
      emptyQueue()
    );
    expect(cycleRepeat(queue).repeat).toBe("all");
    expect(cycleRepeat(cycleRepeat(queue)).repeat).toBe("one");
    const shuffled = setShuffle(queue, true, () => 0);
    expect(shuffled.order[0]).toBe(queue.index);
    expect(shuffled.shuffle).toBe(true);
  });
});
