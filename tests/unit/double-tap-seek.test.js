/**
 * Tests for double-tap seek feature
 */

global.ImprovedTube = {
    storage: {},
    elements: { player: null, video: null },
    input: {},
    showStatus: jest.fn(),
    doubleTapSeek: null
};

const shortcutsCode = require('fs').readFileSync(
    require('path').join(__dirname, '../../js&css/web-accessible/www.youtube.com/shortcuts.js'),
    'utf-8'
);

const match = shortcutsCode.match(/ImprovedTube\.doubleTapSeek\s*=\s*function[\s\S]*?\n};/);
if (match) {
    eval(match[0]);
}

describe('Double-tap seek', () => {
    let mockPlayer;

    beforeEach(() => {
        mockPlayer = {
            getCurrentTime: jest.fn(() => 100),
            getDuration: jest.fn(() => 300),
            seekTo: jest.fn(),
            classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
            querySelector: jest.fn(() => null)
        };
        ImprovedTube.elements.player = mockPlayer;
        ImprovedTube.showStatus.mockClear();
    });

    test('should seek by fixed distance in fixed mode', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 5;
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(105, true);
        expect(mockPlayer.classList.add).toHaveBeenCalledWith('ytp-seek-forward-bump');
    });

    test('should seek backward correctly', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 5;
        ImprovedTube.doubleTapSeek(-1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(95, true);
        expect(mockPlayer.classList.add).toHaveBeenCalledWith('ytp-seek-backward-bump');
    });

    test('should use progressive distances', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'progressive';
        ImprovedTube.storage.player_double_tap_seek_distance_2 = 10;
        ImprovedTube.storage.player_double_tap_seek_distance_3 = 30;
        ImprovedTube.storage.player_double_tap_seek_distance_4 = 60;
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(110, true);
        mockPlayer.getCurrentTime.mockReturnValue(100);
        ImprovedTube.doubleTapSeek(1, 3);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(130, true);
        mockPlayer.getCurrentTime.mockReturnValue(100);
        ImprovedTube.doubleTapSeek(1, 4);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(160, true);
    });

    test('should not seek when mode is default', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'default';
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.seekTo).not.toHaveBeenCalled();
    });

    test('should not seek below 0', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 200;
        mockPlayer.getCurrentTime.mockReturnValue(50);
        ImprovedTube.doubleTapSeek(-1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(0, true);
    });

    test('should not seek beyond duration', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 200;
        mockPlayer.getCurrentTime.mockReturnValue(250);
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.seekTo).toHaveBeenCalledWith(300, true);
    });

    test('should toggle ytp-seek visual classes', () => {
        ImprovedTube.storage.player_double_tap_seek_mode = 'fixed';
        ImprovedTube.storage.player_double_tap_seek_fixed_distance = 10;
        ImprovedTube.doubleTapSeek(1, 2);
        expect(mockPlayer.classList.add).toHaveBeenCalledWith('ytp-seek-forward-bump');
    });
});
