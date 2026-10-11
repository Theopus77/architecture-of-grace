
    /* Did this tab OPEN on an instrument link? Defined here, beside the
       control it governs, and before any screen renders.

       ⚠ IT ASKS THE URL, NOT history.state. The first cut checked
       `history.state.aogIdx > 0` on the theory that a link arrival has no
       in-app history — true for about 240 milliseconds. Every instrument
       calls aogSetHash() right after showScreen(), which pushes a state of
       its own, and the re-assert timer then re-ran showScreen with aogIdx=1
       and put the button back. The URL a tab was opened on does not change
       underneath you; a history index does.

       ⚠ AND IT IS DELIBERATELY NOT `sid`. A per-student link can be opened
       from inside the dashboard, where Back is the right control to have. */
    window.aogLinkArrival_ = function () {
      try {
        var p = new URLSearchParams(window.location.search);
        return !!(p.get("checkin") || p.get("checkinType") || p.get("exit") ||
                  p.get("slip") || p.get("hc") || p.get("home"));
      } catch (e) { return false; }
    };
    