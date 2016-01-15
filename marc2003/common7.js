var VERSION = "7.2014-10-14.01";

var DT_LEFT = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_RIGHT = 0x00000002;
var DT_VCENTER = 0x00000004;
var DT_WORDBREAK = 0x00000010;
var DT_CALCRECT = 0x00000400;
var DT_NOPREFIX = 0x00000800;
var DT_END_ELLIPSIS = 0x00008000;

var MF_GRAYED = 0x00000001;
var MF_STRING = 0x00000000;

var IDC_ARROW = 32512;
var IDC_HAND = 32649;

var ONE_DAY = 86400000;
var ONE_WEEK = 604800000;

String.prototype.addCommas = function() {
	return this.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}

String.prototype.ucfirst = function() {
	return this.charAt(0).toUpperCase() + this.substr(1);
}

function RGB(r, g, b) {
	return (0xff000000 | (r << 16) | (g << 8) | (b));
}

function RGBA(r, g, b, a) {
	return ((a << 24) | (r << 16) | (g << 8) | (b));
}

function toRGB(d) {
	return [d >> 16, d >> 8 & 0xFF, d & 0xFF];
}

function blend_colours(c1, c2, factor) {
	c1 = toRGB(c1);
	c2 = toRGB(c2);
	var r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
	var g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
	var b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
	return (0xff000000 | (r << 16) | (g << 8) | (b));
}

function on_colors_changed() {
	p.colors_changed();
}

function on_font_changed() {
	p.font_changed();
}

function on_selection_changed() {
	p.item_focus_change();
}

function on_playlist_switch() {
	p.item_focus_change();
}

function on_playback_new_track() {
	p.item_focus_change();
}

function on_playback_dynamic_info_track() {
	p.item_focus_change();
}

function on_playback_stop() {
	p.item_focus_change();
}

function on_item_focus_change() {
	p.item_focus_change();
}

function on_mouse_leave() {
	if (typeof b == "object") b.leave();
	if (typeof r == "object") r.leave();
	if (typeof li == "object") li.leave();
	if (typeof s == "object") s.leave();
	if (typeof v == "object") v.leave();
}

function on_mouse_rbtn_up(x, y) {
	p.rbtn_up(x, y);
	return true;
}

function on_notify_data(name, data) {
	if (name == "lastfm" && data == "update" && typeof l == "object") l.notify_data(name, data);
	if (name == "autoplaylists" && data == "update" && typeof li == "object" && li.mode == "autoplaylists") li.update();
	if (name == "love" && typeof ps == "object") l.post(fb.TitleFormat("%LASTFM_LOVED_DB%").EvalWithMetadb(data) == 1 ? "track.unlove" : "track.love", data);
}

function panel(name, features) {
	this.item_focus_change = function() {
		if (!this.metadb_func) return;
		switch(this.selection_mode) {
			case 0:
				this.metadb = fb.GetSelection();
				break;
			case 1:
				this.metadb = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
				break;
			case 2:
				this.metadb = fb.GetFocusItem();
				break;
		}
		if (this.metadb) on_metadb_changed();
	}
	
	this.colors_changed = function() {
		if (this.dui) {
			this.textcolour = window.GetColorDUI(0);
			this.backcolour = window.GetColorDUI(1);
			this.textcolour_hl = window.GetColorDUI(2);
		} else {
			this.textcolour = window.GetColorCUI(0);
			this.backcolour = window.GetColorCUI(3);
			this.textcolour_hl = blend_colours(this.textcolour, this.backcolour, 0.4);
		}
		window.Repaint();
	}
	
	this.font_changed = function() {
		this.font = this.dui ? window.GetFontDUI(0) : window.GetFontCUI(0);
		try {
			this.font_name = this.font.Name;
		} catch(e) {
			this.console("Unable to use your default font. Using Segoe UI instead.");
			this.font_name = "Segoe UI";
		}
		this.title_font = gdi.Font(this.font_name, 16, 1);
		this.normal_font = gdi.Font(this.font_name, this.normal_font_size);
		this.fixed_font = gdi.Font("Lucida Console", this.normal_font_size);
		this.list_font = gdi.Font(this.font_name, this.list_font_size);
		this.row_height = this.normal_font.Height + 2;
		if (typeof t == "object") t.size();
		window.Repaint();
	}
	
	this.size = function() {
		this.w = window.Width;
		this.h = window.Height;
	}
	
	this.move = function(x, y) {
		this.mx = x;
		this.my = y;
	}
	
	this.rbtn_up = function(x, y) {
		var _menu = window.CreatePopupMenu();
		var _custom_background = window.CreatePopupMenu();
		var _metadb = window.CreatePopupMenu();
		var _cover = window.CreatePopupMenu();
		var _font = window.CreatePopupMenu();
		var _sub1 = window.CreatePopupMenu();
		var _sub2 = window.CreatePopupMenu();
		var _sub3 = window.CreatePopupMenu();
		var _sub4 = window.CreatePopupMenu();
		var _sub5 = window.CreatePopupMenu();
		var _sub6 = window.CreatePopupMenu();
		var idx;
		switch(true) {
			case typeof a == "object" && a.trace(x, y):
				_menu.AppendMenuItem(MF_STRING, 1, "Refresh");
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem(MF_STRING, 2, "Front");
				_menu.AppendMenuItem(MF_STRING, 3, "Back");
				_menu.AppendMenuItem(MF_STRING, 4, "Disc");
				_menu.AppendMenuItem(MF_STRING, 5, "Icon");
				_menu.AppendMenuItem(MF_STRING, 6, "Artist");
				_menu.CheckMenuRadioItem(2, 6, a.id + 2);
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem(MF_STRING, 15, "Crop (focus on centre)");
				_menu.AppendMenuItem(MF_STRING, 16, "Crop (focus on top)");
				_menu.AppendMenuItem(MF_STRING, 17, "Centre");
				_menu.AppendMenuItem(MF_STRING, 18, "Stretch");
				_menu.CheckMenuRadioItem(15, 18, a.type == "crop" ? 15 : a.type == "crop top" ? 16 : a.type == "centre" ? 17 : 18);
				_menu.AppendMenuSeparator();
				_cover.AppendMenuItem(this.metadb ? MF_STRING : MF_GRAYED, 21, "Google images (launches browser)");
				_cover.AppendMenuItem(this.metadb ? MF_STRING : MF_GRAYED, 22, "Album Art Downloader");
				_cover.AppendMenuSeparator();
				_cover.AppendMenuItem(MF_STRING, 23, "Help");
				_cover.AppendTo(_menu, MF_STRING, "Cover search");
				_menu.AppendMenuSeparator();
				break;
			case typeof c == "object" && c.trace(x, y):
				if (this.check_feature("now_playing") && !np_cd) break;
				_menu.AppendMenuItem(MF_STRING, 1, "Refresh");
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem(MF_STRING, 11, "Gloss effect");
				_menu.CheckMenuItem(11, c.gloss);
				_menu.AppendMenuItem(MF_STRING, 12, "Shadow effect");
				_menu.CheckMenuItem(12, c.shadow);
				_menu.AppendMenuSeparator();
				_cover.AppendMenuItem(this.metadb ? MF_STRING : MF_GRAYED, 21, "Google images (launches browser)");
				_cover.AppendMenuItem(this.metadb ? MF_STRING : MF_GRAYED, 22, "Album Art Downloader");
				_cover.AppendMenuSeparator();
				_cover.AppendMenuItem(MF_STRING, 23, "Help");
				_cover.AppendTo(_menu, MF_STRING, "Cover search");
				_menu.AppendMenuSeparator();
				break;
			case typeof li == "object" && li.trace(x, y):
				switch(li.mode) {
					case "autoplaylists":
						_menu.AppendMenuItem(MF_STRING, 600, "Change title...");
						_menu.AppendMenuSeparator();
						for (i = 1; i < 9; i++) {
							_sub1.AppendMenuItem(MF_STRING, i + 600, i);
						}
						_sub1.AppendTo(_menu, MF_STRING, "Save slot");
						_sub1.CheckMenuRadioItem(601, 608, li.autoplaylists_slot + 600);
						_menu.AppendMenuSeparator();
						_sub2.AppendMenuItem(MF_STRING, 610, "run query");
						_sub2.AppendMenuItem(MF_STRING, 611, "do nothing");
						_sub2.CheckMenuRadioItem(610, 611, li.autoplaylists_success ? 610 : 611);
						_sub2.AppendTo(_menu, MF_STRING, "On successful creation/edit");
						for (i = 0; i < li.autoplaylists_deleted_items.length; i++) {
							var temp = li.autoplaylists_deleted_items[i].split("¬");
							_sub3.AppendMenuItem(MF_STRING, i + 620, temp[0]);
						}
						if (li.autoplaylists_deleted_items.length > 0) _sub3.AppendTo(_menu, MF_STRING, "Restore");
						_menu.AppendMenuSeparator();
						_menu.AppendMenuItem(MF_STRING, 650, "Replace exisiting playlists with the same name");
						_menu.CheckMenuItem(650, li.autoplaylists_remove_duplicates);
						_menu.AppendMenuSeparator();
						break;
					case "echonest":
						for (i = 0; i < li.echonest_modes.length; i++) {
							_menu.AppendMenuItem(MF_STRING, i + 500, li.echonest_modes[i].ucfirst());
						}
						_menu.CheckMenuRadioItem(500, 502, li.echonest_mode + 500);
						_menu.AppendMenuSeparator();
						break;
					case "lastfm":
						for (i = 0; i < li.lastfm_modes.length; i++) {
							_menu.AppendMenuItem(MF_STRING, 801 + i, li.lastfm_modes[i].ucfirst());
						}
						_menu.CheckMenuRadioItem(801, 805, li.lastfm_mode + 801);
						_menu.AppendMenuSeparator();
						if (li.lastfm_mode != 2) {
							_sub1.AppendMenuItem(MF_STRING, 811, "Last.fm");
							_sub1.AppendMenuItem(MF_STRING, 812, "Autoplaylist");
							_sub1.CheckMenuRadioItem(811, 812, li.lastfm_link == "last.fm" ? 811 : 812);
							_sub1.AppendTo(_menu, MF_STRING, "Links");
							_menu.AppendMenuSeparator();
						}
						_menu.AppendMenuItem(MF_STRING, 51, "Last.fm auto-correct");
						_menu.CheckMenuItem(51, l.auto_correct);
						_menu.AppendMenuSeparator();
						break;
					case "lastfm_charts":
						_menu.AppendMenuItem(l.username.length > 0 ? MF_STRING : MF_GRAYED, 1000, "Refresh");
						_menu.AppendMenuSeparator();
						for (i = 0; i < li.lastfm_charts_modes.length; i++) {
							_menu.AppendMenuItem(MF_STRING, i + 1001, li.lastfm_charts_modes[i].ucfirst());
						}
						_menu.CheckMenuRadioItem(1001, 1003, li.lastfm_charts_mode + 1001);
						_menu.AppendMenuSeparator();
						for (i = 0; i < li.lastfm_charts_periods_display.length; i++) {
							_menu.AppendMenuItem(MF_STRING, i + 1004, li.lastfm_charts_periods_display[i].ucfirst());
						}
						_menu.CheckMenuRadioItem(1004, 1009, li.lastfm_charts_period + 1004);
						_menu.AppendMenuSeparator();
						_sub1.AppendMenuItem(MF_STRING, 811, "Last.fm");
						_sub1.AppendMenuItem(MF_STRING, 812, "Autoplaylist");
						_sub1.CheckMenuRadioItem(811, 812, li.lastfm_link == "last.fm" ? 811 : 812);
						_sub1.AppendTo(_menu, MF_STRING, "Links");
						_menu.AppendMenuSeparator();
						_menu.AppendMenuItem(MF_STRING, 1010, "Bar colour...");
						_menu.AppendMenuSeparator();
						break;
					case "musicbrainz":
						_menu.AppendMenuItem(MF_STRING, 700, "Releases");
						_menu.AppendMenuItem(MF_STRING, 701, "Links");
						_menu.CheckMenuRadioItem(700, 701, li.musicbrainz_mode == "releases" ? 700 : 701);
						_menu.AppendMenuSeparator();
						if (li.musicbrainz_mode == "releases") {
							_menu.AppendMenuItem(MF_STRING, 702, "Include albums");
							_menu.CheckMenuItem(702, li.musicbrainz_album);
							_menu.AppendMenuItem(MF_STRING, 703, "Include EPs");
							_menu.CheckMenuItem(703, li.musicbrainz_ep);
							_menu.AppendMenuItem(MF_STRING, 704, "Include singles");
							_menu.CheckMenuItem(704, li.musicbrainz_single);
							_menu.AppendMenuSeparator();
							_menu.AppendMenuItem(MF_STRING, 705, "Include 'Live' releases");
							_menu.CheckMenuItem(705, li.musicbrainz_live);
							_menu.AppendMenuItem(MF_STRING, 706, "Include 'Remix' releases");
							_menu.CheckMenuItem(706, li.musicbrainz_remix);
							_menu.AppendMenuItem(MF_STRING, 707, "Include 'Compilation' releases");
							_menu.CheckMenuItem(707, li.musicbrainz_compilation);
							_menu.AppendMenuSeparator();
							_menu.AppendMenuItem(MF_STRING, 708, "Show release type");
							_menu.CheckMenuItem(708, li.musicbrainz_show_release_type);
							_menu.AppendMenuSeparator();
							_menu.AppendMenuItem(MF_STRING, 710, "Newest first");
							_menu.CheckMenuItem(710, li.reverse_sort);
							_menu.AppendMenuSeparator();
						} else {
							_menu.AppendMenuItem(MF_STRING, 709, "Show icons");
							_menu.CheckMenuItem(709, li.musicbrainz_icons);
							_menu.AppendMenuSeparator();
						}
						break;
				}
				break;
			case typeof ps == "object" && b.buttons.ps.trace(x, y):
				_sub1.AppendMenuItem(utils.CheckComponent("foo_customdb", true) && !ps.loved_working && !ps.playcount_working && l.username.length > 0 ? MF_STRING : MF_GRAYED, 1100, "loved tracks and playcount");
				_sub1.AppendMenuItem(utils.CheckComponent("foo_customdb", true) && !ps.loved_working && !ps.playcount_working && l.username.length > 0 ? MF_STRING : MF_GRAYED, 1109, "loved tracks only");
				_sub1.AppendMenuSeparator();
				_sub1.AppendMenuItem(MF_STRING, 1102, "Show console");
				_sub1.CheckMenuItem(1102, ps.show_console);
				_sub1.AppendTo(_menu, MF_STRING, "Library import");
				_menu.AppendMenuSeparator();
				_sub2.AppendMenuItem(MF_STRING, 52, "Last.fm auto-correct");
				_sub2.CheckMenuItem(52, l.auto_correct);
				_sub2.AppendMenuItem(MF_STRING, 1110, "Only update tracks in library");
				_sub2.CheckMenuItem(1110, ps.library);
				_sub2.AppendMenuItem(MF_STRING, 1111, "Extended logging");
				_sub2.CheckMenuItem(1111, ps.logging);
				_sub2.AppendTo(_menu, MF_STRING, "Auto-updates");
				_menu.AppendMenuSeparator();
				_sub3.AppendMenuItem(MF_STRING, 1104, "Off");
				_sub3.AppendMenuItem(MF_STRING, 1105, "On");
				_sub3.CheckMenuRadioItem(1104, 1105, ps.auto_love ? 1105 : 1104);
				_sub3.AppendMenuSeparator();
				_sub3.AppendMenuItem(ps.auto_love ? MF_STRING : MF_GRAYED, 1106, "Condition");
				_sub3.AppendTo(_menu, MF_STRING, "Automatically love tracks");
				_menu.AppendMenuSeparator();
				if (b.buttons.ps.w != 50) {
					_sub4.AppendMenuItem(MF_STRING, 1107, "tango");
					_sub4.AppendMenuItem(MF_STRING, 1108, "silk");
					_sub4.CheckMenuRadioItem(1107, 1108, ps.icon == "tango" ? 1107 : 1108);
					_sub4.AppendTo(_menu, MF_STRING, "Icon");
					_menu.AppendMenuSeparator();
				}
				break;
			case typeof s == "object" && s.mode == "spectrogram" && s.trace(x, y) :
				_menu.AppendMenuItem(MF_STRING, 1804, "SoX options...");
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem(MF_STRING, 1805, "Marker colour...");
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem(MF_STRING, 1803, "Only analyse tracks in library");
				_menu.CheckMenuItem(1803, s.library);
				_menu.AppendMenuSeparator();
				_sub1.AppendMenuItem(MF_STRING, 1800, "Clear all");
				_sub1.AppendMenuItem(MF_STRING, 1801, "Clear older than 1 day");
				_sub1.AppendMenuItem(MF_STRING, 1802, "Clear older than 1 week");
				_sub1.AppendMenuSeparator();
				_sub1.AppendMenuItem(MF_GRAYED, 1803, "In use: " + (this.fso.GetFolder(spectrogram_cache).size / 1048576).toFixed(2) + "MB");
				_sub1.AppendTo(_menu, MF_STRING, "Cached images");
				_menu.AppendMenuSeparator();
				break;
			case typeof t == "object" && t.trace(x, y):
				if (this.check_feature("now_playing") && !np_bio) break;
				switch(t.mode) {
					case "allmusic":
						_sub1.AppendMenuItem(MF_STRING, 60, "Artist...");
						_sub1.AppendMenuItem(MF_STRING, 61, "Album...");
						_sub1.AppendTo(_menu, MF_STRING, "Field remapping");
						_menu.AppendMenuSeparator();
						_menu.AppendMenuItem(this.metadb ? MF_STRING : MF_GRAYED, 62, "Paste text from clipboard");
						_menu.AppendMenuSeparator();
						break;
					case "lastfm_album":
						_menu.AppendMenuItem(MF_STRING, 53, "Last.fm auto-correct");
						_menu.CheckMenuItem(53, l.auto_correct);
						_menu.AppendMenuSeparator();
						break;
					case "lastfm_wiki":
						_menu.AppendMenuItem(MF_STRING, 25, "Last.fm");
						_menu.AppendMenuItem(MF_STRING, 26, "Wikipedia");
						_menu.CheckMenuRadioItem(25, 26, t.source == "last.fm" ? 25 : 26);
						_menu.AppendMenuSeparator();
						break;
					case "simple_tag":
						_menu.AppendMenuItem(MF_STRING, 1700, "Custom title...");
						_menu.AppendMenuItem(MF_STRING, 1701, "Custom tag...");
						_menu.AppendMenuSeparator();
						_menu.AppendMenuItem(MF_STRING, 1702, "Centre text");
						_menu.CheckMenuItem(1702, t.centre);
						_menu.AppendMenuSeparator();
						break;
					case "simple_text":
						_menu.AppendMenuItem(MF_STRING, 1703, "Refresh");
						_menu.AppendMenuSeparator();
						_menu.AppendMenuItem(MF_STRING, 1700, "Custom title...");
						_menu.AppendMenuItem(MF_STRING, 200, "Custom path...");
						_menu.AppendMenuSeparator();
						_menu.AppendMenuItem(MF_STRING, 201, "Fixed width font");
						_menu.CheckMenuItem(201, t.fixed);
						_menu.AppendMenuSeparator();
						break;
				}
				_font.AppendMenuItem(MF_STRING, 30, 12);
				_font.AppendMenuItem(MF_STRING, 31, 14);
				_font.AppendMenuItem(MF_STRING, 32, 16);
				_font.AppendTo(_menu, MF_STRING, "Font size");
				_font.CheckMenuRadioItem(30, 33, this.normal_font_size == 12 ? 30 : this.normal_font_size == 14 ? 31 : 32);
				_menu.AppendMenuSeparator();
				break;
			case typeof th == "object":
			case typeof im == "object" && im.trace(x, y):
				if (im.mode == "last.fm") {
					_menu.AppendMenuItem(this.metadb ? MF_STRING : MF_GRAYED, 450, "Download artist art from Last.fm");
					_menu.AppendMenuItem(MF_STRING, 454, "Help");
					_menu.AppendMenuSeparator();
					_sub1.AppendMenuItem(MF_STRING, 451, "Off");
					_sub1.AppendMenuItem(MF_STRING, 452, "Library tracks only");
					_sub1.AppendMenuItem(MF_STRING, 453, "All tracks");
					_sub1.CheckMenuRadioItem(451, 453, im.auto_download == "off" ? 451 : im.auto_download == "library" ? 452 : 453);
					_sub1.AppendTo(_menu, MF_STRING, "Automatic download");
					_sub6.AppendMenuItem(MF_STRING, 470, "Small");
					_sub6.AppendMenuItem(MF_STRING, 471, "Medium");
					_sub6.AppendMenuItem(MF_STRING, 472, "Original");
					_sub6.CheckMenuRadioItem(470, 472, im.download_size == "small" ? 470 : im.download_size == "medium" ? 471 : 472);
					_sub6.AppendTo(_menu, MF_STRING, "Download size");
					_sub2.AppendMenuItem(MF_STRING, 461, "1");
					_sub2.AppendMenuItem(MF_STRING, 463, "3");
					_sub2.AppendMenuItem(MF_STRING, 465, "5");
					_sub2.CheckMenuRadioItem(461, 465, im.limit + 460);
					_sub2.AppendTo(_menu, MF_STRING, "Limit");
				} else {
					_menu.AppendMenuItem(MF_STRING, 442, "Set custom folder...");
				}
				_menu.AppendMenuSeparator();
				_sub3.AppendMenuItem(MF_STRING, 440, "Last.fm artist art");
				_sub3.AppendMenuItem(MF_STRING, 441, "Custom folder");
				_sub3.CheckMenuRadioItem(440, 441, im.mode == "last.fm" ? 440 : 441);
				_sub3.AppendTo(_menu, MF_STRING, "Image source");
				_menu.AppendMenuSeparator();
				if (im.mode == "custom") {
					_menu.AppendMenuItem(MF_STRING, 403, "Re-scan folder");
					_menu.AppendMenuSeparator();
				}
				_sub4.AppendMenuItem(MF_STRING, 410, "Off");
				_sub4.AppendMenuItem(MF_STRING, 415, "5 seconds");
				_sub4.AppendMenuItem(MF_STRING, 420, "10 seconds");
				_sub4.AppendMenuItem(MF_STRING, 430, "20 seconds");
				_sub4.CheckMenuRadioItem(410, 430, im.cycle + 410);
				_sub4.AppendTo(_menu, MF_STRING, "Cycle");
				_menu.AppendMenuSeparator();
				if (typeof th == "object") {
					if (!this.check_feature("now_playing")) _sub5.AppendMenuItem(MF_STRING, 1200, "Grid");
					_sub5.AppendMenuItem(MF_STRING, 1201, "Left");
					_sub5.AppendMenuItem(MF_STRING, 1202, "Right");
					_sub5.AppendMenuItem(MF_STRING, 1203, "Top");
					_sub5.AppendMenuItem(MF_STRING, 1204, "Bottom");
					_sub5.AppendMenuItem(MF_STRING, 1205, "Off");
					_sub5.CheckMenuRadioItem(1200, 1205, th.mode == "grid" ? 1200 : th.mode == "left" ? 1201 : th.mode == "right" ? 1202 : th.mode == "top" ? 1203 : th.mode == "bottom" ? 1204 : 1205);
					if (th.mode != "off") {
						_sub5.AppendMenuSeparator();
						_sub5.AppendMenuItem(MF_STRING, 1275, "75px");
						_sub5.AppendMenuItem(MF_STRING, 1300, "100px");
						_sub5.AppendMenuItem(MF_STRING, 1350, "150px");
						_sub5.AppendMenuItem(MF_STRING, 1400, "200px");
						_sub5.AppendMenuItem(MF_STRING, 1450, "250px");
						_sub5.AppendMenuItem(MF_STRING, 1500, "300px");
						_sub5.CheckMenuRadioItem(1275, 1500, th.px + 1200);
					}
					_sub5.AppendTo(_menu, MF_STRING, "Thumbs");
					_menu.AppendMenuSeparator();
				}
				if (im.trace(x, y) && (!this.check_feature("thumbs") || th.mode != "grid")) {
					if (this.metadb) {
						_menu.AppendMenuItem(MF_STRING, 400, "Open containing folder");
						_menu.AppendMenuSeparator();
					}
					if (im.images.length > 0) {
						_menu.AppendMenuItem(MF_STRING, 401, "Open image");
						_menu.AppendMenuItem(MF_STRING, 402, "Delete image");
						_menu.AppendMenuSeparator();
						_menu.AppendMenuItem(MF_STRING, 404, "Crop (focus on centre)");
						_menu.AppendMenuItem(MF_STRING, 405, "Crop (focus on top)");
						_menu.AppendMenuItem(MF_STRING, 406, "Centre");
						_menu.AppendMenuItem(MF_STRING, 407, "Stretch");
						_menu.CheckMenuRadioItem(404, 407, im.type == "crop" ? 404 : im.type == "crop top" ? 405 : im.type == "centre" ? 406 : 407);
						_menu.AppendMenuSeparator();
					}
				}
				break;
		}
		if (this.check_feature("now_playing")) {
			_menu.AppendMenuItem(MF_STRING, 44, "Top style");
			_menu.AppendMenuItem(MF_STRING, 45, "Bottom style");
			_menu.CheckMenuRadioItem(44, 45, np_track_top ? 44 : 45);
			_menu.AppendMenuSeparator();
			_menu.AppendMenuItem(MF_STRING, 41, "Show CD cover");
			_menu.CheckMenuItem(41, np_cd);
			_menu.AppendMenuItem(MF_STRING, 42, "Show track info");
			_menu.CheckMenuItem(42, np_track);
			_menu.AppendMenuItem(MF_STRING, 46, "Show rating");
			_menu.CheckMenuItem(46, np_rating);
			_menu.AppendMenuItem(MF_STRING, 40, "Show web links");
			_menu.CheckMenuItem(40, np_buttons);
			_menu.AppendMenuItem(MF_STRING, 43, "Show biography");
			_menu.CheckMenuItem(43, np_bio);
			_menu.AppendMenuSeparator();
		}
		if (this.check_feature("custom_background")) {
			if (!this.dui) _custom_background.AppendMenuItem(MF_STRING, 100, "None");
			_custom_background.AppendMenuItem(MF_STRING, 101, this.dui ? "Use default UI setting" : "Use columns UI setting");
			_custom_background.AppendMenuItem(MF_STRING, 102, "Splitter");
			_custom_background.AppendMenuItem(MF_STRING, 103, "Custom");
			_custom_background.AppendMenuSeparator();
			_custom_background.AppendMenuItem(this.background_mode == 3 ? MF_STRING : MF_GRAYED, 105, "Set custom colour...");
			_custom_background.CheckMenuRadioItem(100, 103, this.background_mode + 100);
			_custom_background.AppendTo(_menu, MF_STRING, "Background");
			_menu.AppendMenuSeparator();
		}
		if (typeof l == "object" && l.need_username) {
			_menu.AppendMenuItem(MF_STRING, 1900, "Last.fm username...");
			if (typeof ps == "object") _menu.AppendMenuItem(l.username.length > 0 ? MF_STRING : MF_GRAYED, 1901, "Last.fm password...");
			_menu.AppendMenuSeparator();
		}
		if (this.check_feature("metadb")) {
			_metadb.AppendMenuItem(MF_STRING, 900, "Use display preferences");
			_metadb.AppendMenuItem(MF_STRING, 901, "Prefer now playing");
			_metadb.AppendMenuItem(MF_STRING, 902, "Follow selected track");
			_metadb.CheckMenuRadioItem(900, 903, this.selection_mode + 900);
			_metadb.AppendTo(_menu, MF_STRING, "Selection mode");
			_menu.AppendMenuSeparator();
		}
		if (this.check_feature("remap")) {
			_menu.AppendMenuItem(MF_STRING, 7, "Artist field remapping...");
			_menu.AppendMenuSeparator();
		}
		_menu.AppendMenuItem(MF_STRING, 20, "Update script");
		_menu.AppendMenuSeparator();
		if (utils.IsKeyPressed(0x10)) _menu.AppendMenuItem(MF_STRING, 9, "Properties");
		_menu.AppendMenuItem(MF_STRING, 10, "Configure...");
		idx = _menu.TrackPopupMenu(x, y);
		switch(idx) {
			case 1:
				this.item_focus_change();
				break;
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
				a.id = idx - 2;
				window.SetProperty("artreader_id", a.id);
				this.item_focus_change();
				break;
			case 7:
				this.artist_tf = this.InputBox("The default is %artist%\n\nYou can use the full foobar2000 title formatting syntax here.", "Artist field remapping", this.artist_tf);
				if (this.artist_tf == "") this.artist_tf = "%artist%";
				window.SetProperty("artist_tf", this.artist_tf);
				this.item_focus_change();
				break;
			case 9:
				window.ShowProperties();
				break;
			case 10:
				window.ShowConfigure();
				break;
			case 11:
				c.gloss = !c.gloss;
				window.SetProperty("cd_gloss", c.gloss);
				window.Repaint();
				break;
			case 12:
				c.shadow = !c.shadow;
				window.SetProperty("cd_shadow", c.shadow);
				window.Repaint();
				break;
			case 15:
			case 16:
			case 17:
			case 18:
				a.type = idx == 15 ? "crop" : idx == 16 ? "crop top" : idx == 17 ? "centre" : "stretch";
				window.SetProperty("artreader_image_type", a.type);
				window.RepaintRect(a.x, a.y, a.w, a.h);
				break;
			case 20:
				this.update_script();
				break;
			case 21:
				this.browser("https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(this.eval("%album artist%[ %album%]")));
				break;
			case 22:
				this.aad();
				break;
			case 23:
				fb.ShowPopupMessage("You can get Album Art Downloader here:\n\nhttp://www.hydrogenaud.io/forums/index.php?showtopic=57392", this.name);
				break;
			case 25:
			case 26:
				t.source = idx == 25 ? "last.fm" : "wikipedia";
				window.SetProperty("biography_source", t.source);
				t.artist = "";
				this.item_focus_change();
				break;
			case 30:
			case 31:
			case 32:
				this.normal_font_size = idx == 30 ? 12 : idx == 31 ? 14 : 16;
				window.SetProperty("normal_font_size", this.normal_font_size);
				this.font_changed();
				break;
			case 40:
				np_buttons = !np_buttons;
				window.SetProperty("np_buttons", np_buttons);
				on_size();
				window.Repaint();
				break;
			case 41:
				np_cd = !np_cd;
				window.SetProperty("np_cd", np_cd);
				window.Repaint();
				break;
			case 42:
				np_track = !np_track;
				window.SetProperty("np_track", np_track);
				on_size();
				window.Repaint();
				break;
			case 43:
				np_bio = !np_bio;
				window.SetProperty("np_bio", np_bio);
				window.Repaint();
				break;
			case 44:
			case 45:
				np_track_top = idx == 44 ? true : false;
				window.SetProperty("np_track_top", np_track_top);
				on_size();
				window.Repaint();
				break;
			case 46:
				np_rating = !np_rating;
				window.SetProperty("np_rating", np_rating);
				on_size();
				window.Repaint();
				break;
			case 51:
			case 52:
			case 53:
				l.auto_correct = !l.auto_correct;
				window.SetProperty("lastfm_auto_correct", l.auto_correct);
				if (this.metadb) {
					if (idx == 51) li.get();
					if (idx == 53) t.get();
				}
				break;
			case 60:
				t.allmusic_artist_tf = this.InputBox("The default is %album artist%\n\nYou can use the full foobar2000 title formatting syntax here.", "Artist field remapping", t.allmusic_artist_tf);
				if (t.allmusic_artist_tf == "") t.allmusic_artist_tf = "%album artist%";
				window.SetProperty("allmusic_artist_tf", t.allmusic_artist_tf);
				this.item_focus_change();
				break;
			case 61:
				t.allmusic_album_tf = this.InputBox("The default is %album%\n\nYou can use the full foobar2000 title formatting syntax here.", "Album field remapping", t.allmusic_album_tf);
				if (t.allmusic_album_tf == "") t.allmusic_album_tf = "%album%";
				window.SetProperty("allmusic_album_tf", t.allmusic_album_tf);
				this.item_focus_change();
				break;
			case 62:
				if (!this.doc) this.doc = new ActiveXObject("htmlfile");
				var text = this.doc.parentWindow.clipboardData.getData("Text");
				if (typeof text == "string") {
					this.save(text, t.filename);
					t.artist = "";
					t.album == "";
					this.item_focus_change();
				}
				break;
			case 100:
			case 101:
			case 102:
			case 103:
				this.background_mode = idx - 100;
				window.SetProperty("background_mode", this.background_mode);
				window.Repaint();
				break;
			case 105:
				this.background_custom_colour = this.InputBox("Enter a custom colour for the background. Uses RGB. Example usage:\n\n234-211-74", this.name, this.background_custom_colour);
				window.SetProperty("background_custom_colour", this.background_custom_colour);
				window.Repaint();
				break;
			case 200:
				t.filename_tf = this.InputBox("Use title formatting to specify a path to your text file. eg: $directory_path(%path%)\\info.txt\n\nIf you prefer, you can specify just the path to a folder and the first txt or log file will be used.", this.name, t.filename_tf);
				window.SetProperty("text_filename_tf", t.filename_tf);
				this.item_focus_change();
				break;
			case 201:
				t.fixed = !t.fixed;
				window.SetProperty("text_fixed_font", t.fixed);
				t.calc();
				window.RepaintRect(t.x, t.y, t.w, t.h);
				break;
			case 400:
				if (im.images.length == 0) this.run(im.folders[0]);
				else this.run("explorer /select,\"" + im.files[im.index] + "\"");
				break;
			case 401:
				this.run("\"" + im.files[im.index] + "\"");
				break;
			case 402:
				im.delete_image();
				break;
			case 403:
				im.update();
				break;
			case 404:
			case 405:
			case 406:
			case 407:
				im.type = idx == 404 ? "crop" : idx == 405 ? "crop top" : idx == 406 ? "centre" : "stretch";
				window.SetProperty("image_type", im.type);
				window.Repaint();
				break;
			case 410:
			case 415:
			case 420:
			case 430:
				im.cycle = idx - 410;
				window.SetProperty("image_cycle", im.cycle);
				break;
			case 440:
			case 441:
				im.mode = idx == 440 ? "last.fm" : "custom";
				window.SetProperty("image_mode", im.mode);
				im.artist = "";
				im.folder = "";
				this.item_focus_change();
				break;
			case 442:
				im.custom_folder_tf = this.InputBox("Enter title formatting or an absolute path to a folder. You can specify multiple folders using | as a separator.", this.name, im.custom_folder_tf);
				if (im.custom_folder_tf == "") im.custom_folder_tf = "$directory_path(%path%)";
				window.SetProperty("image_custom_folder_tf", im.custom_folder_tf);
				im.folder = "";
				this.item_focus_change();
				break;
			case 450:
				im.download();
				break;
			case 451:
			case 452:
			case 453:
				im.auto_download = idx == 451 ? "off" : idx == 452 ? "library" : "all";
				window.SetProperty("image_auto_download", im.auto_download);
				break;
			case 454:
				fb.ShowPopupMessage("There have been changes at Last.fm recently meaning I've had to change the way this script works. A few things to note:\n\n-Downloads are noticeably slower now and there is no indication of it working. It can take anything upto a minute now. For this reason, automatic downloads have been turned off by default. You can turn it back on if you like.\n\n-The automatic download option only triggers when there are no existing images and when you start playback. It will not download on a selection change or when playing back streams with dynamic metadata.\n\n-If you see HTTP status code 0 in the console, you need to hold shift and right click the panel. Edit the value of \"images_domain\" to whichever localised last.fm site you use like \"http://wwww.lastfm.de\" etc.", this.name);
				break;
			case 461:
			case 463:
			case 465:
				im.limit = idx - 460;
				window.SetProperty("image_limit", im.limit);
				break;
			case 470:
			case 471:
			case 472:
				im.download_size = idx == 470 ? "small" : idx == 471 ? "medium" : "original";
				window.SetProperty("image_download_size", im.download_size);
				break;
			case 490:
			case 491:
			case 492:
			case 493:
				im.type = idx == 490 ? "crop" : idx == 491 ? "crop top" : idx == 492 ? "centre" : "stretch";
				window.SetProperty("image_type", im.type);
				window.RepaintRect(im.x, im.y, im.w, im.h);
				break;
			case 500:
			case 501:
			case 502:
				li.echonest_mode = idx - 500;
				window.SetProperty("echonest_mode", li.echonest_mode);
				li.artist = "";
				this.item_focus_change();
				break;
			case 600:
				li.autoplaylists_title = this.InputBox("Enter a new title", this.name, li.autoplaylists_title);
				if (li.autoplaylists_title == "") li.autoplaylists_title = "Autoplaylists";
				window.SetProperty("autoplaylists_title", li.autoplaylists_title);
				window.Repaint();
				break;
			case 601:
			case 602:
			case 603:
			case 604:
			case 605:
			case 606:
			case 607:
			case 608:
				li.autoplaylists_slot = idx - 600;
				window.SetProperty("autoplaylists_slot", li.autoplaylists_slot);
				li.filename = this.settings_folder + "autoplaylists" + li.autoplaylists_slot;
				li.update();
				break;
			case 610:
			case 611:
				li.autoplaylists_success = idx == 610 ? true : false;
				window.SetProperty("autoplaylists_success", li.autoplaylists_success);
				break;
			case 620:
			case 621:
			case 622:
			case 623:
			case 624:
			case 625:
			case 626:
			case 627:
				li.data.push(li.autoplaylists_deleted_items[idx - 620]);
				if (li.data.length > li.rows) li.offset = li.data.length - li.rows;
				li.autoplaylists_deleted_items.splice(idx - 620, 1);
				this.save(li.data.join("\n"), li.filename);
				window.NotifyOthers("autoplaylists", "update");
				li.update();
				break;
			case 650:
				li.autoplaylists_remove_duplicates = !li.autoplaylists_remove_duplicates
				window.SetProperty("autoplaylists_remove_duplicates", li.autoplaylists_remove_duplicates);
				break;
			case 700:
			case 701:
				li.musicbrainz_mode = idx == 700 ? "releases" : "URLs";
				window.SetProperty("musicbrainz_mode", li.musicbrainz_mode);
				li.artist = "";
				this.item_focus_change();
				break;
			case 702:
				li.musicbrainz_album = !li.musicbrainz_album;
				window.SetProperty("musicbrainz_album", li.musicbrainz_album);
				li.artist = "";
				this.item_focus_change();
				break;
			case 703:
				li.musicbrainz_ep = !li.musicbrainz_ep;
				window.SetProperty("musicbrainz_ep", li.musicbrainz_ep);
				li.artist = "";
				this.item_focus_change();
				break;
			case 704:
				li.musicbrainz_single = !li.musicbrainz_single;
				window.SetProperty("musicbrainz_single", li.musicbrainz_single);
				li.artist = "";
				this.item_focus_change();
				break;
			case 705:
				li.musicbrainz_live = !li.musicbrainz_live;
				window.SetProperty("musicbrainz_live", li.musicbrainz_live);
				li.artist = "";
				this.item_focus_change();
				break;
			case 706:
				li.musicbrainz_remix = !li.musicbrainz_remix;
				window.SetProperty("musicbrainz_remix", li.musicbrainz_remix);
				li.artist = "";
				this.item_focus_change();
				break;
			case 707:
				li.musicbrainz_compilation = !li.musicbrainz_compilation;
				window.SetProperty("musicbrainz_compilation", li.musicbrainz_compilation);
				li.artist = "";
				this.item_focus_change();
				break;
			case 708:
				li.musicbrainz_show_release_type = !li.musicbrainz_show_release_type;
				window.SetProperty("musicbrainz_show_release_type", li.musicbrainz_show_release_type);
				window.RepaintRect(li.x, li.y, li.w, li.h);
				break;
			case 709:
				li.musicbrainz_icons = !li.musicbrainz_icons;
				window.SetProperty("musicbrainz_icons", li.musicbrainz_icons);
				window.RepaintRect(li.x, li.y, li.w, li.h);
				break;
			case 710:
				li.reverse_sort = !li.reverse_sort;
				window.SetProperty("reverse_sort", li.reverse_sort);
				li.artist = "";
				this.item_focus_change();
				break;
			case 801:
			case 802:
			case 803:
			case 804:
			case 805:
				li.lastfm_mode = idx - 801;
				window.SetProperty("lastfm_mode", li.lastfm_mode);
				li.artist = "";
				this.item_focus_change();
				break;
			case 811:
			case 812:
				li.lastfm_link = idx == 811 ? "last.fm" : "autoplaylist";
				window.SetProperty("lastfm_link", li.lastfm_link);
				break;
			case 900:
			case 901:
			case 902:
				this.selection_mode = idx - 900;
				window.SetProperty("selection_mode", this.selection_mode);
				this.item_focus_change();
				break;
			case 1000:
				li.get();
				break;
			case 1001:
			case 1002:
			case 1003:
				li.lastfm_charts_mode = idx - 1001;
				window.SetProperty("lastfm_charts_mode", li.lastfm_charts_mode);
				li.update();
				break;
			case 1004:
			case 1005:
			case 1006:
			case 1007:
			case 1008:
			case 1009:
				li.lastfm_charts_period = idx - 1004;
				window.SetProperty("lastfm_charts_period", li.lastfm_charts_period);
				li.update();
				break;
			case 1010:
				li.lastfm_charts_bar_colour = this.InputBox("Enter a custom colour for the bars. Uses RGB. Example usage:\n\n72-127-221", this.name, li.lastfm_charts_bar_colour);
				window.SetProperty("lastfm_charts_bar_colour", li.lastfm_charts_bar_colour);
				window.Repaint();
				break;
			case 1100:
			case 1109:
				ps.full_import = idx == 1100 ? true : false;
				ps.start_import();
				break;
			case 1102:
				ps.show_console = !ps.show_console;
				window.SetProperty("playcount_sync_show_console", ps.show_console);
				break;
			case 1104:
			case 1105:
				ps.auto_love = idx == 1104 ? false : true;
				window.SetProperty("playcount_sync_auto_love", ps.auto_love);
				break;
			case 1106:
				ps.auto_love_tf = this.InputBox("The result of the title formatting set here must equal 1 for a track to be automatically loved.\n\nExample:\n\n$ifequal(%rating%,5,1,0)", this.name, ps.auto_love_tf);
				window.SetProperty("playcount_sync_auto_love_tf", ps.auto_love_tf);
				break;
			case 1107:
			case 1108:
				ps.icon = idx == 1107 ? "tango" : "silk";
				window.SetProperty("playcount_sync_icon", ps.icon);
				b.update();
				break;
			case 1110:
				ps.library = !ps.library;
				window.SetProperty("playcount_sync_library", ps.library);
				break;
			case 1111:
				ps.logging = !ps.logging;
				window.SetProperty("playcount_sync_logging", ps.logging);
				break;
			case 1200:
			case 1201:
			case 1202:
			case 1203:
			case 1204:
			case 1205:
				th.mode = idx == 1200 ? "grid" : idx == 1201 ? "left" : idx == 1202 ? "right" : idx == 1203 ? "top" : idx == 1204 ? "bottom" : "off";
				window.SetProperty("thumbs_mode", th.mode);
				th.nc = true;
				on_size();
				window.Repaint();
				break;
			case 1275:
			case 1300:
			case 1350:
			case 1400:
			case 1450:
			case 1500:
				th.px = idx - 1200;
				window.SetProperty("thumbs_px", th.px);
				th.nc = true;
				on_size();
				window.Repaint();
				break;
			case 1700:
				t.title = this.InputBox("You can use full title formatting here.", this.name, t.title);
				window.SetProperty("text_title", t.title);
				window.Repaint();
				break;
			case 1701:
				t.tag = this.InputBox("Enter a custom tag.", this.name, t.tag);
				window.SetProperty("text_tag", t.tag);
				t.filename = "";
				this.item_focus_change();
				break;
			case 1702:
				t.centre = !t.centre;
				window.SetProperty("text_centre", t.centre);
				window.RepaintRect(t.x, t.y, t.w, t.h);
				break;
			case 1703:
				t.filename = "";
				this.item_focus_change();
				break;
			case 1800:
			case 1801:
			case 1802:
				var period = idx == 1800 ? 0 : idx == 1801 ? ONE_DAY : ONE_WEEK;
				s.clear_images(period);
				break;
			case 1803:
				s.library = !s.library;
				window.SetProperty("seekbar_library", s.library);
				break;
			case 1804:
				s.sox_params = this.InputBox("All SoX spectrogram options should work here.\n\n-r, -d and -o are already configured so do not use those. Check sox.pdf for everything else.", this.name, s.sox_params);
				window.SetProperty("sox_params", s.sox_params);
				if (fb.IsPlaying) s.playback_new_track();
				break;
			case 1805:
				s.marker = this.InputBox("Enter a custom colour for the marker. Uses RGB. Example usage:\n\n234-211-74", this.name, s.marker);
				window.SetProperty("seekbar_marker", s.marker);
				break;
			case 1900:
				l.update_username();
				break;
			case 1901:
				l.update_password();
				break;
		}
		_menu.Dispose();
		_custom_background.Dispose();
		_metadb.Dispose();
		_cover.Dispose();
		_font.Dispose();
		_sub1.Dispose();
		_sub2.Dispose();
		_sub3.Dispose();
		_sub4.Dispose();
		_sub5.Dispose();
		_sub6.Dispose();
	}
	
	this.features_init = function() {
		for (i = 0; i < this.features.length; i++) {
			switch(this.features[i]) {
				case "discogs":
					fb.ShowPopupMessage("This script is no longer supported. Consider using musicbrainz instead.", this.name);
					break;
				case "custom_background":
					this.background_mode = window.GetProperty("background_mode", 1);
					this.background_custom_colour = window.GetProperty("background_custom_colour", "0-0-0");
					break;
				case "metadb":
					this.selection_mode = window.GetProperty("selection_mode", 1);
					break;
				case "themes":
					this.themed_seekbar = window.CreateThemeManager("Progress");
					this.themed_header = window.CreateThemeManager("Header");
					this.themed_header.SetPartAndStateId(1, 1);
					this.themed_button = window.CreateThemeManager("Button");
					break;
				case "remap":
					this.artist_tf = window.GetProperty("artist_tf", "%artist%");
					break;
			}
		}
	}
	
	this.check_feature = function(f) {
		for (i = 0; i < this.features.length; i++) {
			if (this.features[i] == f) return true;
		}
		return false;
	}
	
	this.eval = function(tf) {
		if (!this.metadb || tf == "") return "";
		if (fb.IsPlaying && this.is_stream()) {
			tf = fb.TitleFormat(tf).Eval();
			try { tf = decodeURIComponent(tf); } catch(e) {}
			return tf;
		} else {
			return fb.TitleFormat(tf).EvalWithMetadb(this.metadb);
		}
	}
	
	this.is_stream = function() {
		var path = fb.TitleFormat("$if2(%__@%,%path%)").EvalWithMetadb(this.metadb);
		switch(true) {
			case path.indexOf("http") == 0:
			case path.indexOf("mms") == 0:
				return true;
			default:
				return false;
		}
	}
	
	this.open = function(filename) {
		return utils.ReadTextFile(filename);
	}
	
	this.save = function(t, f) {
		try {
			var ts = this.fso.OpenTextFile(f, 2, true, -1);
			ts.WriteLine(t);
			ts.Close();
			return true;
		} catch(e) {
			return false;
		}
	}
	
	this.console = function(message) {
		fb.trace(this.name + ": " + message);
	}
	
	this.strip_tags = function(value) {
		try {
			if (!this.doc) this.doc = new ActiveXObject("htmlfile");
			this.doc.open();
			var div = this.doc.createElement("div");
			div.innerHTML = value.replace(/\n/g, "<br>");
			var text = div.innerText.trim();
			this.doc.close();
			return text;
		} catch(e) {
			return "Error reading content.";
		}
	}
	
	this.InputBox = function(prompt, title, value) {
		prompt = prompt.replace(/"/g, '" + Chr(34) + "').replace(/\n/g, '" + Chr(13) + "');
		title = title.replace(/"/g, '" + Chr(34) + "');
		value = value.replace(/"/g, '" + Chr(34) + "');
		var temp_value = this.vb.eval('InputBox' + '("' + prompt + '", "' + title + '", "' + value + '")');
		if (typeof temp_value == "undefined") return value;
		if (temp_value.length == 254) this.MsgBox("Your entry was too long and will be truncated.\n\nSee the WSH panel mod script discussion thread on hydrogenaudio forums for help.", 0, this.name);
		return temp_value.trim();
	}
	
	this.MsgBox = function(prompt, buttons, title) {
		prompt = prompt.replace(/"/g, '" + Chr(34) + "').replace(/\n/g, '" + Chr(13) + "');
		title = title.replace(/"/g, '" + Chr(34) + "');
		return this.vb.eval('MsgBox' + '("' + prompt + '", "' + buttons + '", "' + title + '")');
	}
	
	this.browser = function(command) {
		if (!this.run(command)) this.MsgBox("Unable to launch your default browser.", 0, this.name);
	}
	
	this.run = function(command) {
		try {
			this.WshShell.Run(command);
			return true;
		} catch(e) {
			return false;
		}
	}
	
	this.aad = function() {
		var aad_path = window.GetProperty("aad_path", "");
		if (!this.fso.FileExists(aad_path)) {
			if (!this.app) this.app = new ActiveXObject("Shell.Application");
			var folder = this.app.BrowseForFolder(0, "Locate Album Art Downloader", 0x00000200);
			var file = folder ? folder.items().item().path + "\\AlbumArt.exe" : "";
			if (this.fso.FileExists(file)) {
				aad_path = file;
				window.SetProperty("aad_path", file);
			}
		}
		if (this.fso.FileExists(aad_path)) {
			var album_artist = "/ar \"" + this.eval("[%album artist%]") + "\"";
			var album = " /al \"" + this.eval("[%album%]") + "\"";
			this.run("\"" + aad_path + "\"" + album_artist + album);
		}
	}
	
	this.tt = function(t) {
		if (this.tooltip.Text == t) return;
		this.tooltip.Text = t;
		this.tooltip.Activate();
	}
	
	this.ttd = function() {
		this.tooltip.Text = "";
		this.tooltip.Deactivate();
	}
	
	this.splitRGB = function(value) {
		var temp_col = value.split("-");
		return RGB(temp_col[0], temp_col[1], temp_col[2]);
	}
	
	this.draw_background = function(gr) {
		if (this.check_feature("custom_background")) {
			var col;
			switch(this.background_mode) {
				case 0:
					col = null;
					break;
				case 1:
					col = this.backcolour;
					break;
				case 2:
					col = utils.GetSysColor(15);
					break;
				case 3:
					col = this.splitRGB(this.background_custom_colour);
					break;
			}
			if (col) gr.FillSolidRect(0, 0, this.w, this.h, col);
		} else {
			gr.FillSolidRect(0, 0, this.w, this.h, this.backcolour);
		}
	}
	
	this.draw_image = function(gr, img, pos_x, pos_y, width, height, type, border, alpha) {
		if (!img) return;
		gr.SetInterpolationMode(7);
		switch(type) {
			case "crop":
			case "crop top":
				var sr = img.Width / img.Height;
				var dr = width / height;
				if (sr < dr) {
					var r = img.Width / width;
					var ch = height * r;
					var sy = Math.round((img.Height - ch) / (type == "crop top" ? 4 : 2));
					var cw = img.Width;
					var sx = 0;
				} else {
					var r = img.Height / height;
					var cw = width * r;
					var sx = Math.round((img.Width - cw) / 2);
					var ch = img.Height;
					var sy = 0;
				}
				gr.DrawImage(img, pos_x, pos_y, width, height, sx + 5, sy + 5, cw - 10, ch - 10, 0, alpha || 255);
				if (border) gr.DrawRect(pos_x, pos_y, width - 1, height - 1, 1, border);
				break;
			case "stretch":
				gr.DrawImage(img, pos_x, pos_y, width, height, 0, 0, img.Width, img.Height, 0, alpha || 255);
				if (border) gr.DrawRect(pos_x, pos_y, width - 1, height - 1, 1, border);
				break;
			case "centre":
			default:
				var s = Math.min(width / img.Width, height / img.Height);
				var nw = Math.floor(img.Width * s);
				var nh = Math.floor(img.Height * s);
				pos_x += Math.round((width - nw) / 2);
				pos_y += Math.round((height - nh) / 2);
				if (type == "centre") gr.DrawImage(img, pos_x, pos_y, nw, nh, 5, 5, img.Width - 10, img.Height - 10, 0, alpha || 255);
				else gr.DrawImage(img, pos_x, pos_y, nw, nh, 0, 0, img.Width, img.Height, 0, alpha || 255);
				if (border) gr.DrawRect(pos_x, pos_y, nw - 1, nh - 1, 1, border);
				break;
		}
	}
	
	this.header = function(gr, text) {
		//not used by current scripts but will leave intact for old ones
		this.left_text(gr, text, this.title_font, this.textcolour_hl, 6, 6, this.w - 77, 24);
		gr.DrawLine(6, 29, this.w - 6, 29, 1, this.textcolour_hl);
	}
	
	this.centre_text = function(gr, text, font, colour, x, y, w, h) {
		gr.GdiDrawText(text, font, colour, x, y, w, h, DT_VCENTER | DT_CENTER | DT_WORDBREAK | DT_CALCRECT | DT_NOPREFIX);
	}
	
	this.left_text = function(gr, text, font, colour, x, y, w, h) {
		gr.GdiDrawText(text, font, colour, x, y, w, h, DT_VCENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX);
	}
	
	this.right_text = function(gr, text, font, colour, x, y, w, h) {
		gr.GdiDrawText(text, font, colour, x, y, w, h, DT_VCENTER | DT_RIGHT | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX);
	}
	
	this.format_time = function(t) {
		t = Math.round(t);
		var w = Math.floor(t / 604800);
		var d = Math.floor((t -= w * 604800) / 86400);
		var h = Math.floor((t -= d * 86400) / 3600);
		var m = Math.floor((t -= h * 3600) / 60);
		var s = Math.round(t -= m * 60);
		var temp = "";
		if (w > 0) temp += w + "wk ";
		if (w > 0 || d > 0) temp += d + "d ";
		if (w > 0 || d > 0 || h > 0) temp += h + ":";
		temp += (m < 10 && h > 0 ? "0" + m : m) + ":";
		temp += (s < 10 ? "0" + s : s);
		return temp;
	}
	
	this.check_version = function() {
		//not used any more but will leave intact so old scripts don't crash.
	}
	
	this.update_script = function() {
		if (!this.xmlhttp) this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		this.xmlhttp.open("GET", this.common_url, true);
		this.xmlhttp.send();
		this.xmlhttp.onreadystatechange = function() {
			if (p.xmlhttp.readyState == 4) {
				switch(p.xmlhttp.status) {
					case 200:
						var text = p.xmlhttp.responsetext;
						switch (true) {
							case text.indexOf("function panel") == -1:
								p.MsgBox("Unexpected server error. Not updating.", 0, p.name);
								break;
							case text.indexOf("var VERSION = \"" + VERSION) == 0:
								p.MsgBox("Already using latest version.", 0, p.name);
								break;
							default:
								if (p.save(text, p.common_filename)) {
									if (p.MsgBox("Download successful. Restart foobar2000 now?", 4, p.name) == 6) fb.RunMainMenuCommand("File/Restart");
								} else {
									p.MsgBox("Unexpected error. Not updating.", 0, p.name);
								}
								break;
						}
						break;
					case 404:
						fb.ShowPopupMessage("The script reports that the update file has not been found. It could be a temporary problem with dropbox but if this error persists then it is most likely due to support stopping for this version. Check the hydrogenaudio thread or the full zip for updates.\n\nhttp://www.hydrogenaud.io/forums/index.php?showtopic=77883\n" + p.root_url + "samples.zip", p.name);
						break;
					default:
						p.console(p.xmlhttp.responsetext || "HTTP error: " + p.xmlhttp.status);
						break;
				}
			}
		}
	}
	
	this.json_parse = function(text) {
		try {
			var data = JSON.parse(text);
			return data;
		} catch(e) {
			this.console("JSON.parse error.");
			return false;
		}
	}
	
	this.json_sort = function(data, prop, reverse) {
		data = data.sort(function(a, b) {
			if (!a[prop]) return 1;
			if (!b[prop]) return -1;
			if (a[prop] < b[prop]) return reverse ? 1 : -1;
			if (a[prop] > b[prop]) return reverse ? -1 : 1;
			return 0;
		});
		return data;
	}
	
	this.clean_filename = function(filename) {
		return filename.replace(/[\/\\|:]/g, '-').replace(/\*/g, 'x').replace(/"/g, "''").replace(/[?<>]/g, '_');
	}
	
	this.delete_file = function(filename) {
		if (!this.fso.FileExists(filename)) return;
		try {
			this.fso.DeleteFile(filename);
		} catch(e) {
			this.console("Could not delete " + filename);
		}
	}
	
	this.name = name;
	this.features = features;
	this.dui = window.InstanceType;
	this.script_path = fb.ProfilePath + "marc2003\\";
	this.images_path = this.script_path + "images\\";
	this.root_url = "https://dl.dropboxusercontent.com/u/22801321/wsh/"
	this.common_url = this.root_url + "marc2003/common7.js";
	this.common_filename = this.script_path + "common7.js";
	this.tooltip = window.CreateTooltip();
	this.w = 0;
	this.h = 0;
	this.mx = 0;
	this.my = 0;
	this.metadb = fb.GetFocusItem();
	this.WshShell = new ActiveXObject("WScript.Shell");
	this.fso = new ActiveXObject("Scripting.FileSystemObject");
	this.vb = new ActiveXObject("ScriptControl");
	this.vb.Language = "VBScript";
	this.settings_folder = fb.ProfilePath + "wsh_settings\\";
	if (!this.fso.FolderExists(this.settings_folder)) this.fso.CreateFolder(this.settings_folder);
	this.data_folder = fb.ProfilePath + "wsh_lastfm\\";
	if (!this.fso.FolderExists(this.data_folder)) this.fso.CreateFolder(this.data_folder);
	this.artist = "";
	this.artist_tf = "%artist%";
	this.normal_font_size = window.GetProperty("normal_font_size", 14);
	this.list_font_size = window.GetProperty("list_font_size", 11);
	this.up_img = gdi.Image(this.images_path + "up.png");
	this.down_img = gdi.Image(this.images_path + "down.png");
	this.metadb_func = typeof on_metadb_changed == "function";
	this.features_init();
	this.colors_changed();
	this.font_changed();
}

function artreader(x, y, w, h) {
	this.draw = function(gr) {
		if (!this.img) return;
		p.draw_image(gr, this.img, this.x, this.y, this.w, this.h, this.type);
	}
	
	this.metadb_changed = function() {
		if (!p.metadb) return;
		this.img && this.img.Dispose();
		this.path = "";
		this.img = utils.GetAlbumArtV2(p.metadb, this.id);
		window.RepaintRect(this.x, this.y, this.w, this.h);
		utils.GetAlbumArtAsync(window.ID, p.metadb, this.id);
	}
	
	this.get_album_art_done = function(ip) {
		this.path = ip;
	}
	
	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}
	
	this.wheel = function(step) {
		if (!this.trace(p.mx, p.my)) return false;
		this.id -= step;
		if (this.id < 0) this.id = 4;
		if (this.id > 4) this.id = 0;
		window.SetProperty("artreader_id", this.id);
		this.metadb_changed();
		return true;
	}
	
	this.move = function(x, y) {
		if (this.trace(x, y)) {
			if (this.img) p.tt("Original size: " + this.img.Width + "x" + this.img.Height + "px");
			return true;
		} else {
			p.ttd();
			return false;
		}
	}
	
	this.lbtn_dblclk = function(x, y) {
		if (!this.trace(x, y)) return false;
		if (this.img) p.run("explorer /select,\"" + this.path + "\"");
		return true;
	}
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.id = window.GetProperty("artreader_id", 0);
	this.img = null;
	this.path = null;
	this.type = window.GetProperty("artreader_image_type", "crop");
}

function buttons() {
	this.draw = function(gr) {
		for (i in this.buttons) {
			this.buttons[i].draw(gr);
		}
	}
	
	this.move = function(x, y) {
		this.tmp_btn = null;
		for (i in this.buttons) {
			if (this.buttons[i].trace(x, y)) this.tmp_btn = i;
		}
		if (this.btn == this.tmp_btn) return this.btn;
		if (this.tmp_btn) this.buttons[this.tmp_btn].state("hover");
		if (this.btn) this.buttons[this.btn].state("normal");
		this.btn = this.tmp_btn;
		return this.btn;
	}
	
	this.lbtn_up = function(x, y) {
		if (!this.btn) return false;
		this.buttons[this.btn].lbtn_up(x, y);
		return true;
	}
	
	this.leave = function() {
		if (this.btn) this.buttons[this.btn].state("normal");
		this.btn = null;
	}
	
	this.buttons = [];
	this.btn = null;
}

function button(x, y, w, h, img_src, func, tiptext, themed) {
	this.draw = function (gr) {
		if (this.themed) {
			p.themed_button.SetPartAndStateId(1, this.id);
			p.themed_button.DrawThemeBackground(gr, this.x, this.y, this.w, this.h);
			this.img && p.draw_image(gr, this.img, this.x + Math.round((this.w - this.img.Width) / 2), this.y + Math.round((this.h - this.img.Height) / 2), this.img.Width, this.img.Height);
		} else {
			this.img && p.draw_image(gr, this.img, this.x, this.y, this.w, this.h);
		}
	}
	
	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}
	
	this.lbtn_up = function () {
		this.func && this.func(x, y);
	}
	
	this.state = function(s) {
		if (s == "hover") {
			this.img = this.img_hover;
			this.id = 2;
			p.tt(this.tiptext);
		} else {
			this.img = this.img_normal;
			this.id = 0;
			p.ttd();
		}
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.func = func;
	this.tiptext = tiptext;
	this.themed = themed;
	this.id = 0;
	this.img_normal = gdi.Image(p.images_path + img_src.normal);
	this.img_hover = img_src.hover ? gdi.Image(p.images_path + img_src.hover) : this.img_normal;
	this.img = this.img_normal;
}

function cd(x, y, w, h) {
	this.draw = function(gr) {
		if (this.shadow) p.draw_image(gr, this.shadow_img, this.x, this.y, this.w, this.h);
		p.draw_image(gr, this.case_img, this.x, this.y, this.w, this.h);
		if (this.img) {
			this.ratio = Math.min(this.w / this.case_img.Width, this.h / this.case_img.Height);
			this.nw = 488 * this.ratio;
			this.nh = 476 * this.ratio;
			this.nx = Math.round((this.w - (452 * this.ratio)) / 2);
			this.ny = Math.round((this.h - this.nh) / 2);
			p.draw_image(gr, this.img, this.nx + this.x, this.ny + this.y, this.nw, this.nh, "crop top");
		}
		p.draw_image(gr, this.semi_img, this.x, this.y, this.w, this.h);
		if (this.gloss) p.draw_image(gr, this.gloss_img, this.x, this.y, this.w, this.h);
	}
	
	this.metadb_changed = function() {
		if (!p.metadb) return;
		this.img && this.img.Dispose();
		this.path = "";
		this.img = utils.GetAlbumArtV2(p.metadb, 0);
		window.Repaint();
		utils.GetAlbumArtAsync(window.ID, p.metadb, 0);
	}
	
	this.get_album_art_done = function(ip) {;
		this.path = ip;
	}
	
	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}
	
	this.move = function(x, y) {
		if (this.trace(x, y)) {
			if (this.img) p.tt("Original size: " + this.img.Width + "x" + this.img.Height + "px");
			return true;
		} else {
			p.ttd();
			return false;
		}
	}
	
	this.lbtn_dblclk = function(x, y) {
		if (!this.trace(x, y)) return false;
		if (this.img) p.run("explorer /select,\"" + this.path + "\"");
		return true;
	}
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.shadow_img = gdi.Image(p.images_path + "shadow.png");
	this.case_img = gdi.Image(p.images_path + "case.png");
	this.semi_img = gdi.Image(p.images_path + "semi.png");
	this.gloss_img = gdi.Image(p.images_path + "gloss.png");
	this.gloss = window.GetProperty("cd_gloss", false);
	this.shadow = window.GetProperty("cd_shadow", false);
	this.img = null;
	this.path = null;
}

function images(x, y, w, h) {
	this.playback_time = function(time) {
		if (this.mode == "last.fm" && time == 1 && this.files.length == 0 && p.metadb.RawPath == fb.GetNowPlaying().RawPath && ((this.auto_download == "library" && fb.IsMetadbInMediaLibrary(p.metadb)) || this.auto_download == "all")) this.download();
	}
	
	this.draw = function (gr) {
		if (this.images.length > 0) p.draw_image(gr, this.images[this.index], this.x, this.y, this.w, this.h, this.type);
	}
	
	this.metadb_changed = function() {
		if (!p.metadb) return false;
		switch(this.mode) {
			case "last.fm":
				p.artist = p.eval(p.artist_tf);
				if (this.artist == p.artist) return false;
				this.artist = p.artist;
				this.folder = p.data_folder + p.eval("$crc32(" + p.artist_tf + ")");
				if (!p.fso.FolderExists(this.folder)) p.fso.CreateFolder(this.folder);
				break;
			case "custom":
				this.temp_folder = p.eval(this.custom_folder_tf);
				if (this.temp_folder == this.folder) return false;
				this.folder = this.temp_folder;
				break;
		}
		this.update();
		return true;
	}
	
	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}
	
	this.wheel = function(step) {
		if (!p.metadb || this.images.length < 2 || !this.trace(p.mx, p.my) || (typeof th == "object" && th.mode == "grid" && !th.overlay)) return false;
		this.index -= step;
		if (this.index < 0) this.index = this.images.length - 1;
		if (this.index >= this.images.length) this.index = 0;
		window.Repaint();
		return true;
	}
	
	this.lbtn_dblclk = function(x, y) {
		if (!this.trace(x, y)) return false;
		if (this.files.length > 0) p.run("\"" + this.files[this.index] + "\"");
		return true;
	}
	
	this.download = function() {
		if (!p.fso.FolderExists(this.folder) || p.artist == "" || p.artist == "?") return;
		if (!this.xmlhttp) this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		if (p.fso.FileExists(p.script_path + "download.vbs")) {
			var folder = this.folder + "\\";
			var url = this.domain + "/music/" + encodeURIComponent(p.artist) + "/+images";
			var func = function() {
				var text = im.xmlhttp.responsetext;
				if (!im.doc) im.doc = new ActiveXObject("htmlfile");
				im.doc.open();
				var div = im.doc.createElement("div");
				div.innerHTML = text;
				var data = div.getElementsByTagName("img");
				var urls = [];
				for (i = 0; i < data.length; i++) {
					if (data[i].src.indexOf("http://userserve-ak.last.fm/serve/126s") == 0) urls.push(data[i].src.replace("126s", im.download_size == "small" ? "252" : im.download_size == "medium" ? "500" : "_"));
				}
				for (i = 0; i < Math.min(urls.length, im.limit, 5); i++) {
					p.WshShell.Run("cscript //nologo \"" + p.script_path + "download.vbs\" \"" + urls[i] + "\" \"" + folder + p.clean_filename(p.artist) + "_" + urls[i].substring(urls[i].lastIndexOf("/") + 1) + "\"", 0, false);
				}
				im.doc.close();
			}
		} else {
			var url = p.root_url + "marc2003/download.vbs";
			var func = function() {
				if (!p.save(im.xmlhttp.responsetext, p.script_path + "download.vbs")) return;
				im.download();
			}
		}
		this.xmlhttp.open("GET", url, true);
		this.xmlhttp.send();
		this.xmlhttp.onreadystatechange = function() {
			if (im.xmlhttp.readyState == 4) {
				if (im.xmlhttp.status == 200) {
					func();
				} else {
					p.console("HTTP error: " + im.xmlhttp.status);
				}
			}
		}
	}
	
	this.images_from_folder = function(folder) {
		if (!p.fso.FolderExists(folder)) return [];
		var f, fi, path, ext;
		var files = [];
		f = p.fso.GetFolder(folder);
		fi = new Enumerator(f.files);
		for (; !fi.atEnd(); fi.moveNext()) {
			path = fi.item().path;
			ext = path.split(".").pop().toLowerCase();
			if (ext == "png" || ext == "jpg" || ext == "jpeg" || ext == "gif") files.push(path);
		}
		return files;
	}
	
	this.update = function() {
		this.index = 0;
		for (i = 0; i < this.images.length; i++) {
			try { this.images[i].Dispose(); } catch(e) {}
		}
		this.folders = this.folder.split("|");
		this.files = [];
		for (i = 0; i < this.folders.length; i++) {
			this.files = this.files.concat(this.images_from_folder(this.folders[i]));
		}
		if (this.mode == "last.fm") {
			this.files.sort(function(a, b) {
				var time_a = Date.parse(p.fso.Getfile(a).DateLastModified);
				var time_b = Date.parse(p.fso.GetFile(b).DateLastModified);
				if (time_a < time_b) return 1;
				if (time_a > time_b) return -1;
				return 0;
			});
		} else {
			this.files.sort();
		}
		this.images = [];
		for (i = 0; i < this.files.length; i++) {
			this.images[i] = gdi.Image(this.files[i]);
		}
		if (typeof th == "object") {
			th.nc = true;
			th.calc();
		}
		window.Repaint();
	}
	
	this.delete_image = function() {
		if (!this.app) this.app = new ActiveXObject("Shell.Application");
		this.app.Namespace(10).MoveHere(this.files[this.index]);
		window.SetTimeout(function() {
			im.update();
			window.NotifyOthers("images", "update");
		}, 100);
	}
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.files = [];
	this.images = [];
	this.index = 0;
	this.artist = "";
	this.folder = "";
	this.limit = window.GetProperty("image_limit", 5);
	this.cycle = window.GetProperty("image_cycle", 10);
	this.mode = window.GetProperty("image_mode", "last.fm");
	this.type = window.GetProperty("image_type", "crop top");
	this.auto_download = window.GetProperty("image_auto_download", "off");
	this.download_size = window.GetProperty("image_download_size", "original");
	this.custom_folder_tf = window.GetProperty("image_custom_folder_tf", "$directory_path(%path%)");
	this.domain = window.GetProperty("images_domain", "http://www.last.fm");
	this.time = 0;
	window.SetInterval(function() {
		im.time++;
		if (im.cycle > 0 && im.images.length > 1 && im.time % im.cycle == 0) {
			im.index++;
			if (im.index == im.images.length) im.index = 0;
			window.Repaint();
		}
		if (im.mode == "last.fm" && im.time % 3 == 0 && im.images_from_folder(im.folder).length != im.files.length) im.update();
	}, 1000);
}

function lastfm() {
	this.notify_data = function(name, data) {
		if (name == "lastfm" && data == "update") {
			this.username = p.open(this.username_file).trim();
			this.sk = p.open(this.sk_file).trim();
			if (p.check_feature("lastfm_charts")) li.update();
			if (typeof ps == "object") {
				ps.loved_working = false;
				ps.playcount_working = false;
				b.update();
				p.item_focus_change();
			}
			window.Repaint();
		}
	}
	
	this.post = function(method, metadb) {
		if (!this.xmlhttp) this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		switch(method) {
			case "auth.getMobileSession":
				var func = function() {
					var json_data = p.json_parse(l.xmlhttp.responsetext);
					if (!json_data) return;
					if (json_data.error) {
						p.MsgBox(json_data.message, 0, p.name);
					} else if (json_data.session) {
						p.save(json_data.session.key, l.sk_file);
						window.NotifyOthers("lastfm", "update");
						l.notify_data("lastfm", "update");
					}
				}
				
				this.authToken = hex_md5(this.username + hex_md5(this.password));
				this.api_sig = hex_md5("api_key" + this.api_key + "authToken" + this.authToken + "method" + method + "username" + this.username + this.secret);
				this.data = "method=" + method + "&api_key=" + this.api_key + "&api_sig=" + this.api_sig + "&format=json&authToken=" + this.authToken + "&username=" + this.username;
				break;
			case "track.love":
			case "track.unlove":
				var func = function() {
					var json_data = p.json_parse(l.xmlhttp.responsetext);
					if (!json_data) return;
					if (json_data.error) {
						p.console(json_data.message);
					} else if (json_data.status && json_data.status == "ok") {
						p.console("Track " + (method == "track.love" ? "loved successfully." : "unloved successfully."));
						fb.RunContextCommandWithMetadb("Customdb Love " + (method == "track.love" ? 1 : 0), metadb, 8);
					}
				}
				
				if (!metadb || this.username.length == 0 || this.sk.length != 32) return;
				this.artist = fb.TitleFormat(p.artist_tf).EvalWithMetadb(metadb);
				this.track = fb.TitleFormat("%title%").EvalWithMetadb(metadb);
				if (this.artist == "" || this.artist == "?" || this.track == "?") return;
				p.console("Attempting to " + (method == "track.love" ? "love \"" : "unlove \"") + this.track + "\" by \"" + this.artist + "\"");
				p.console("Contacting Last.fm....");
				this.api_sig = hex_md5("api_key" + this.api_key + "artist" + this.artist + "method" + method + "sk" + this.sk + "track" + this.track + this.secret);
				this.data = "method=" + method + "&api_key=" + this.api_key + "&api_sig=" + this.api_sig + "&format=json&sk=" + this.sk + "&artist=" + encodeURIComponent(this.artist) + "&track=" + encodeURIComponent(this.track);
				break;
			default:
				return;
		}
		
		this.xmlhttp.open("POST", "https://ws.audioscrobbler.com/2.0/", true);
		this.xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		this.xmlhttp.setRequestHeader("User-Agent", this.user_agent);
		this.xmlhttp.send(this.data);
		this.xmlhttp.onreadystatechange = function() {
			if (l.xmlhttp.readyState == 4) {
				if (l.xmlhttp.status == 200) {
					func();
				} else {
					p.console(l.xmlhttp.responsetext || "HTTP error: " + l.xmlhttp.status);
				}
			}
		}
	}
	
	this.update_username = function() {
		var old_username = this.username;
		this.username = p.InputBox("Enter your Last.fm username.", p.name, this.username);
		if (this.username.length > 0 && this.username != old_username) p.save("", this.sk_file);
		p.save(this.username, this.username_file);
		window.NotifyOthers("lastfm", "update");
		this.notify_data("lastfm", "update");
	}
	
	this.update_password = function() {
		this.password = p.InputBox("Enter your Last.fm password\n\nThis is only required to love/unlove tracks.", p.name, "");
		if (this.password.length > 0) {
			this.sk = "";
			p.save(this.sk, this.sk_file);
			window.NotifyOthers("lastfm", "update");
			this.notify_data("lastfm", "update");
			this.post("auth.getMobileSession");
		}
	}
	
	this.get_url = function() {
		var url = "http://ws.audioscrobbler.com/2.0/?format=json&api_key=" + this.api_key + "&s=" + Math.random();
		if (this.need_username) url += "&user=" + this.username + "&username=" + this.username;
		return url;
	}
	
	this.username_error = "Use the right click menu to set your Last.fm username.";
	this.password_error = "Use the right click menu to set your Last.fm password.";
	this.url = "http://www.last.fm/";
	this.api_key = "56d9e050cc2d6b36102c8b4a5fe6152d";
	this.secret = "9f1f4346ce3ba206390074ff8cb4c6ce";
	this.user_agent = "foobar2000_wsh_panel_mod_lastfm";
	this.username_file = p.settings_folder + "username";
	this.username = p.open(this.username_file).trim();
	this.sk_file = p.settings_folder + "sk";
	this.sk = p.open(this.sk_file).trim();
	this.auto_correct = window.GetProperty("lastfm_auto_correct", true);
	this.need_username = false;
}

function list(x, y, w, h) {
	this.size = function() {
		this.row_height = this.mode == "echonest" ? 90 : 20;
		this.rows = Math.floor((this.h - 30) / this.row_height);
		this.index = 0;
		this.offset = 0;
		switch(true) {
			case this.mode == "lastfm_charts":
				this.text_width = Math.round(this.w / 3);
				this.lastfm_charts_bar_x = this.text_width + 30;
				break;
			case this.mode == "musicbrainz" && this.musicbrainz_mode == "releases":
				this.text_width = this.w - 100;
				break;
			default:
				this.text_width = this.w - 50;
				break;
		}
		this.but_x = this.x + Math.round((this.w - 15) / 2);
		this.up_btn = new sb(this.but_x, this.y, 15, 15, p.up_img, "li.offset > 0", function() { li.wheel(1); });
		this.down_btn = new sb(this.but_x, this.y + this.h - 15, 15, 15, p.down_img, "li.offset < li.items - li.rows", function() { li.wheel(-1); });
	}
	
	this.draw = function(gr) {
		switch(this.mode) {
			case "properties":
				for (i = 0; i < Math.min(this.items, this.rows); i++) {
					p.left_text(gr, this.names[i + this.offset], p.list_font, p.textcolour_hl, this.x, this.y + 15 + (i * this.row_height), this.text_x - 10, this.row_height);
					p.left_text(gr, this.urls[i + this.offset], p.list_font, p.textcolour, this.x + this.text_x, this.y + 15 + (i * this.row_height), this.w - this.text_x - 10, this.row_height);
				}
				break;
			case "lastfm_charts":
				var max_bar_width = (this.w - this.lastfm_charts_bar_x - 40) / this.playcounts[0];
				for (i = 0; i < Math.min(this.items, this.rows); i++) {
					p.right_text(gr, this.ranks[i + this.offset] + ".", p.list_font, p.textcolour_hl, this.x, this.y + 15 + (i * this.row_height), 17, this.row_height);
					var bar_width = max_bar_width * this.playcounts[i + this.offset];
					var bar_colour = p.splitRGB(this.lastfm_charts_bar_colour);
					gr.FillSolidRect(this.lastfm_charts_bar_x + this.x, this.y + 16 + (i * this.row_height), bar_width, 18, bar_colour);
					p.left_text(gr, this.playcounts[i + this.offset].addCommas(), p.list_font, p.textcolour, this.x + 5 + this.lastfm_charts_bar_x + bar_width, this.y + 15 + (i * this.row_height), 50, this.row_height);
					p.left_text(gr, this.names[i + this.offset], p.list_font, p.textcolour, this.x + this.text_x, this.y + 15 + (i * this.row_height), this.text_width, this.row_height);
				}
				break;
			case "lastfm":
				for (i = 0; i < Math.min(this.items, this.rows); i++) {
					p.left_text(gr, this.names[i + this.offset], p.list_font, p.textcolour, this.x + this.text_x, this.y + 15 + (i * this.row_height), this.text_width, this.row_height);
				}
				break;
			case "musicbrainz":
				this.text_x = this.musicbrainz_mode == "URLs" && this.musicbrainz_icons ? 20 : 0;
				for (i = 0; i < Math.min(this.items, this.rows); i++) {
					if (this.musicbrainz_mode == "releases") {
						if (this.musicbrainz_show_release_type) p.right_text(gr, this.release_types[i + this.offset], p.list_font, p.textcolour, this.x, this.y + 15 + (i * this.row_height), this.w - 30, this.row_height);
						p.right_text(gr, this.dates[i + this.offset], p.list_font, p.textcolour_hl, this.x, this.y + 15 + (i * this.row_height), this.w, this.row_height);
					} else {
						if (this.musicbrainz_icons) p.draw_image(gr, this.musicbrainz_images[this.images[i + this.offset]], this.x, this.y + 16 + (i * this.row_height), 16, 16);
					}
					p.left_text(gr, this.names[i + this.offset], p.list_font, p.textcolour, this.x + this.text_x, this.y + 15 + (i * this.row_height), this.text_width, this.row_height);
				}
				break;
			case "autoplaylists":
				for (i = 0; i < Math.min(this.items, this.rows); i++) {
					p.left_text(gr, this.names[i + this.offset], p.list_font, p.textcolour, this.x, this.y + 15 + (i * this.row_height), this.text_width, this.row_height);
					if (!this.autoplaylists_editing && this.autoplaylists_hover && this.index == i + this.offset) {
						p.draw_image(gr, this.autoplaylists_edit_img, this.x + this.w - 40, this.y + 16 + (i * this.row_height), 16, 16);
						p.draw_image(gr, this.autoplaylists_del_img, this.x + this.w - 20, this.y + 16 + (i * this.row_height), 16, 16);
					}
				}
				break;
			case "echonest":
				for (i = 0; i < Math.min(this.items, this.rows); i++) {
					p.left_text(gr, this.names[i + this.offset], p.title_font, p.textcolour_hl, this.x, this.y + 15 + (i * this.row_height), this.w - 110, 24);
					p.right_text(gr, this.dates[i + this.offset], p.title_font, p.textcolour_hl, this.x, this.y + 15 + (i * this.row_height), this.w, 24);
					gr.GdiDrawText(this.summaries[i + this.offset], p.normal_font, p.textcolour, this.x, this.y + 37 + (i * this.row_height), this.w, (p.normal_font.Height * Math.floor(64 / p.normal_font.Height)) + 2, DT_WORDBREAK | DT_CALCRECT | DT_NOPREFIX);
				}
				break;
		}
		this.up_btn.draw(gr);
		this.down_btn.draw(gr);
	}
	
	this.metadb_changed = function() {
		if (!p.metadb) return false;
		if (this.mode != "properties") {
			p.artist = p.eval(p.artist_tf);
			if (this.artist == p.artist) return false;
			this.artist = p.artist;
			this.folder = p.data_folder + p.eval("$crc32(" + p.artist_tf + ")");
			if (!p.fso.FolderExists(this.folder)) p.fso.CreateFolder(this.folder);
		}
		this.update();
		return true;
	}
	
	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}
	
	this.wheel = function(step) {
		if (!this.trace(p.mx, p.my)) return false;
		if (this.items > this.rows) {
			this.offset -= step * (this.mode == "echonest" ? 1 : 3);
			if (this.offset < 0) this.offset = 0;
			if (this.rows + this.offset > this.items) this.offset = this.items - this.rows;
			window.RepaintRect(this.x, this.y, this.w, this.h);
		}
		return true;
	}
	
	this.move = function(x, y) {
		this.index = Math.floor((y - this.y - 15) / this.row_height) + this.offset;
		this.in_range = this.index >= this.offset && this.index < this.offset + Math.min(this.rows, this.items);
		switch(true) {
			case !this.trace(x, y):
			case this.mode == "autoplaylists" && this.autoplaylists_editing:
				window.SetCursor(IDC_ARROW);
				this.leave();
				return false;
			case this.up_btn.trace(x, y):
			case this.down_btn.trace(x, y):
				window.SetCursor(IDC_HAND);
				break;
			case !this.in_range:
				window.SetCursor(IDC_ARROW);
				this.leave();
				break;
			case this.mode == "autoplaylists":
				switch(true) {
					case x > this.x && x < this.x + Math.min(this.names_widths[this.index], this.text_width):
						window.SetCursor(IDC_HAND);
						p.tt('Run "' + this.names[this.index] + '"');
						break;
					case x > this.x + this.w - 40 && x < this.x + this.w - 20:
						window.SetCursor(IDC_HAND);
						p.tt('Edit "' + this.names[this.index] + '"');
						break;
					case x > this.x + this.w - 20 && x < this.x + this.w:
						window.SetCursor(IDC_HAND);
						p.tt('Delete "' + this.names[this.index] + '"');
						break;
					default:
						window.SetCursor(IDC_ARROW);
						this.leave();
						break;
				}
				this.autoplaylists_hover = true;
				window.RepaintRect(this.x + this.w - 40, this.y + 15, 40, Math.min(this.rows, this.items) * this.row_height);
				break;
			case this.mode == "echonest":
			case x > this.x + this.text_x && x < this.x + this.text_x + Math.min(this.names_widths[this.index], this.text_width):
				window.SetCursor(IDC_HAND);
				switch(true) {
					case this.mode == "lastfm" && this.lastfm_mode != 2 && this.lastfm_link == "autoplaylist":
					case this.mode == "lastfm_charts" && this.lastfm_link == "autoplaylist":
					case this.mode == "properties":
						p.tt("Autoplaylist: " + this.queries[this.index]);
						break;
					default:
						p.tt(this.urls[this.index]);
						break;
				}
				break;
			default:
				window.SetCursor(IDC_ARROW);
				p.ttd();
				break;
		}
		return true;
	}
	
	this.lbtn_up = function(x, y) {
		switch(true) {
			case !this.trace(x, y):
				return false;
			case this.mode == "autoplaylists" && this.autoplaylists_editing:
			case this.up_btn.lbtn_up(x, y):
			case this.down_btn.lbtn_up(x, y):
			case !this.in_range:
				break;
			case this.mode == "autoplaylists":
				switch(true) {
					case x > this.x && x < this.x + Math.min(this.names_widths[this.index], this.text_width):
						this.autoplaylists_run(this.names[this.index], this.queries[this.index], this.sorts[this.index], this.forced[this.index]);
						break;
					case x > this.x + this.w - 40 && x < this.x + this.w - 20:
						this.autoplaylists_edit(x, y);
						break;
					case x > this.x + this.w - 20 && x < this.x + this.w:
						this.autoplaylists_delete();
						break
				}
				break;
			case this.mode == "echonest":
			case x > this.x + this.text_x && x < this.x + this.text_x + Math.min(this.names_widths[this.index], this.text_width):
				switch(true) {
					case this.mode == "lastfm" && this.lastfm_mode != 2 && this.lastfm_link == "autoplaylist":
					case this.mode == "lastfm_charts" && this.lastfm_link == "autoplaylist":
					case this.mode == "properties":
						fb.CreateAutoPlaylist(fb.PlaylistCount, this.names[this.index], this.queries[this.index]);
						fb.ActivePlaylist = fb.PlaylistCount - 1;
						break;
					default:
						p.browser(this.urls[this.index]);
						break;
				}
				break;
		}
		return true;
	}
	
	this.leave = function() {
		p.ttd();
		if (this.mode == "autoplaylists") {
			this.autoplaylists_hover = false;
			window.RepaintRect(this.x, this.y, this.w, this.h);
		}
	}
	
	this.update = function() {
		this.items = 0;
		this.offset = 0;
		this.index = 0;
		this.file = null;
		this.data = [];
		var temp_bmp = gdi.CreateImage(1, 1);
		var temp_gr = temp_bmp.GetGraphics();
		switch(this.mode) {
			case "properties":
				this.names = [];
				this.names_widths = [];
				this.urls = [];
				this.queries = [];
				var fileinfo = p.metadb.GetFileInfo();
				var name;
				for (i = 0; i < fileinfo.MetaCount; i++) {
					name = fileinfo.MetaName(i);
					this.names[i] = name.toUpperCase();
					this.urls[i] = p.eval("$meta(" + name + ")").replace(/\s{2,}/g,' ');
					this.queries[i] = this.names[i].toLowerCase() + " IS " + this.urls[i];
				}
				this.names = this.names.concat(["", "PATH", "FILE SIZE", "LAST MODIFIED", ""]);
				this.urls = this.urls.concat(["", p.metadb.Path, p.eval("[%filesize_natural%]"), p.eval("[%last_modified%]"), ""]);
				this.queries = this.queries.concat(["", "%path% IS " + p.metadb.Path, "%filesize_natural% IS " + p.eval("[%filesize_natural%]"), "%last_modified% IS " + p.eval("[%last_modified%]"), ""]);
				for (i = 0; i < fileinfo.InfoCount; i++) {
					name = fileinfo.InfoName(i);
					this.names.push(name.toUpperCase());
					this.urls.push(p.eval("%__" + name + "%"));
					this.queries.push("%__" + name + "%" + " IS " + p.eval("%__" + name + "%"));
				}
				this.items = this.names.length;
				for (i = 0; i < this.items; i++) {
					this.names_widths[i] = temp_gr.CalcTextWidth(this.urls[i], p.list_font);
				}
				fileinfo.Dispose();
				break;
			case "autoplaylists":
				this.names = [];
				this.queries = [];
				this.sorts = [];
				this.forced = [];
				this.names_widths = [];
				this.text = p.open(this.filename);
				this.data = this.text.split(/\r?\n/g);
				this.items = this.data.length;
				for (i = 0; i < this.items; i++) {
					var temp = this.data[i].split("¬");
					this.names[i] = temp[0];
					this.queries[i] = temp[1];
					this.sorts[i] = temp[2];
					this.forced[i] = temp[3];
					this.names_widths[i] = temp_gr.CalcTextWidth(this.names[i], p.list_font);
				}
				break;
			case "lastfm":
				this.names = [];
				this.names_widths = [];
				this.urls = [];
				this.queries = [];
				this.filename = this.folder + "\\" + this.lastfm_methods[this.lastfm_mode] + ".json";
				if (p.fso.fileExists(this.filename)) {
					this.file = p.fso.Getfile(this.filename);
					this.json_text = p.open(this.filename);
					this.json_data = p.json_parse(this.json_text);
					if (this.json_data) {
						switch(true) {
							case this.json_data.error > 0:
								p.console(this.json_data.message);
								break;
							case this.lastfm_mode == 0 && this.json_data.similarartists && typeof this.json_data.similarartists.artist == "object":
								this.data = this.json_data.similarartists.artist;
								var query_text = "artist HAS ";
								break;
							case this.lastfm_mode == 1 && this.json_data.toptags && typeof this.json_data.toptags.tag == "object":
								this.data = this.json_data.toptags.tag;
								var query_text = "genre HAS ";
								break;
							case this.lastfm_mode == 2 && this.json_data.topfans && typeof this.json_data.topfans.user == "object":
								this.data = this.json_data.topfans.user;
								break;
							case this.lastfm_mode == 3 && this.json_data.topalbums && typeof this.json_data.topalbums.album == "object":
								this.data = this.json_data.topalbums.album;
								var query_text = "album HAS ";
								break;
							case this.lastfm_mode == 4 && this.json_data.toptracks && typeof this.json_data.toptracks.track == "object":
								this.data = this.json_data.toptracks.track;
								var query_text = "title HAS ";
								break;
						}
						if (typeof this.data.length == "undefined") this.data = [this.data];
						this.items = this.data.length;
						for (i = 0; i < this.items; i++) {
							this.names[i] = this.data[i].name;
							this.names_widths[i] = temp_gr.CalcTextWidth(this.names[i], p.list_font);
							this.urls[i] = this.data[i].url;
							if (this.lastfm_mode != 2) this.queries[i] = query_text + this.data[i].name;
						}
					}
					if (Date.parse(Date()) - Date.parse(this.file.DateLastModified) > ONE_DAY) this.get();
				} else {
					this.get();
				}
				break;
			case "lastfm_charts":
				this.names = [];
				this.names_widths = [];
				this.urls = [];
				this.queries = [];
				this.ranks = [];
				this.playcounts = [];
				this.filename = this.folder + "\\" + l.username + "_" + this.lastfm_charts_modes[this.lastfm_charts_mode] + "_" + this.lastfm_charts_periods[this.lastfm_charts_period] + ".json";
				if (p.fso.fileExists(this.filename)) {
					this.file = p.fso.Getfile(this.filename);
					this.json_text = p.open(this.filename);
					this.json_data = p.json_parse(this.json_text);
					if (this.json_data) {
						switch(true) {
							case this.json_data.error > 0:
								p.console(this.json_data.message);
								break;
							case this.lastfm_charts_mode == 0 && this.json_data.topartists && typeof this.json_data.topartists.artist == "object":
								this.data = this.json_data.topartists.artist;
								var query_text = "artist HAS ";
								break;
							case this.lastfm_charts_mode == 1 && this.json_data.topalbums && typeof this.json_data.topalbums.album == "object":
								this.data = this.json_data.topalbums.album;
								var query_text = "album HAS ";
								break;
							case this.lastfm_charts_mode == 2 && this.json_data.toptracks && typeof this.json_data.toptracks.track == "object":
								this.data = this.json_data.toptracks.track;
								var query_text = "title HAS ";
								break;
						}
						if (typeof this.data.length == "undefined") this.data = [this.data];
						this.items = this.data.length;
						for (i = 0; i < this.items; i++) {
							this.names[i] = this.lastfm_charts_mode != 0 ? this.data[i].name + " - " + this.data[i].artist.name : this.data[i].name;
							this.names_widths[i] = temp_gr.CalcTextWidth(this.names[i], p.list_font);
							this.urls[i] = this.data[i].url;
							this.queries[i] = query_text + this.data[i].name;
							this.playcounts[i] = this.data[i].playcount;
							this.ranks[i] = i > 0 && this.playcounts[i] == this.playcounts[i - 1] ? this.ranks[i - 1] : this.data[i]["@attr"].rank;
						}
					}
					if (Date.parse(Date()) - Date.parse(this.file.DateLastModified) > ONE_DAY) this.get();
				} else {
					this.get();
				}
				break;
			case "musicbrainz":
				this.names = [];
				this.names_widths = [];
				this.urls = [];
				this.queries = [];
				this.dates = [];
				this.release_types = [];
				this.images = [];
				this.filename = this.folder + "\\musicbrainz_" + this.musicbrainz_mode + ".json";
				if (p.fso.fileExists(this.filename)) {
					this.file = p.fso.Getfile(this.filename);
					this.json_text = p.open(this.filename);
					this.json_data = p.json_parse(this.json_text);
					if (this.json_data) {
						switch(this.musicbrainz_mode) {
							case "releases":
								this.data = this.json_data["release-groups"] || [];
								this.data = p.json_sort(this.data, "first-release-date", this.reverse_sort);
								var primary, secondary, name;
								for (i = 0; i < this.data.length; i++) {
									primary = this.data[i]["primary-type"];
									secondary = this.data[i]["secondary-types"].join("").toLowerCase();
									switch(true) {
										case !this.musicbrainz_remix && secondary.indexOf("remix") > -1:
										case !this.musicbrainz_compilation && secondary.indexOf("compilation") > -1:
										case !this.musicbrainz_live && secondary.indexOf("live") > -1:
											break;
										case this.musicbrainz_single && primary == "Single":
										case this.musicbrainz_ep && primary == "EP":
										case this.musicbrainz_album && primary == "Album":
											name = this.data[i].title;
											this.dates.push(this.data[i]["first-release-date"].substring(0,4));
											this.names.push(name);
											this.urls.push("http://musicbrainz.org/release-group/" + this.data[i].id);
											this.names_widths.push(temp_gr.CalcTextWidth(name, p.list_font));
											this.queries.push("album HAS " + name + " OR title HAS " + name);
											switch(true) {
												case secondary.indexOf("remix") > -1:
													this.release_types.push("Remix");
													break;
												case secondary.indexOf("compilation") > -1:
													this.release_types.push("Compilation");
													break;
												case secondary.indexOf("live") > -1:
													this.release_types.push("Live");
													break;
												default:
													this.release_types.push(primary);
													break;
											}
									}
								}
								this.items = this.names.length;
								break;
							case "URLs":
								this.data = this.json_data.relations || [];
								this.items = this.data.length;
								for (i = 0; i < this.items; i++) {
									this.urls[i] = this.data[i].url.resource;
									this.images[i] = "external";
									if (this.data[i].type == "official homepage") {
										this.images[i] = "home";
									} else {
										for (name in this.musicbrainz_images) {
											if (this.urls[i].indexOf(name) > -1) {
												this.images[i] = name;
												break;
											}
										}
									}
									this.names[i] = decodeURIComponent(this.urls[i]);
									this.names_widths[i] = temp_gr.CalcTextWidth(this.names[i], p.list_font);
								}
								break;
						}
					}
					if (Date.parse(Date()) - Date.parse(this.file.DateLastModified) > ONE_DAY) this.get();
				} else {
					this.get();
				}
				break;
			case "echonest":
				this.names = [];
				this.urls = [];
				this.dates = [];
				this.summaries = [];
				this.filename = this.folder + "\\echonest_" + this.echonest_modes[this.echonest_mode] + ".json";
				if (p.fso.fileExists(this.filename)) {
					this.file = p.fso.Getfile(this.filename);
					this.json_text = p.open(this.filename);
					this.json_data = p.json_parse(this.json_text);
					if (this.json_data && this.json_data.response && this.json_data.response.status && this.json_data.response.status.code == 0) {
						this.data = this.json_data.response[this.echonest_modes[this.echonest_mode]] || [];
						this.items = this.data.length;
						var temp_date;
						for (i = 0; i < this.items; i++) {
							this.names[i] = p.strip_tags(this.data[i].name).replace(/\s{2,}/g,' ');
							this.urls[i] = (this.data[i].url || "").replace(/\\/g, "");
							temp_date = (this.data[i].date_posted || this.data[i].date_reviewed || this.data[i].date_found || "").substring(0, 10);
							this.dates[i] = temp_date.substring(8,10) + "-" + temp_date.substring(5,7) + "-" + temp_date.substring(0,4);
							this.summaries[i] = p.strip_tags(this.data[i].summary);
						}
					}
					if (Date.parse(Date()) - Date.parse(this.file.DateLastModified) > ONE_DAY) this.get();
				} else {
					this.get();
				}
				break;
		}
		temp_bmp.ReleaseGraphics(temp_gr);
		temp_bmp.Dispose();
		temp_gr = null;
		temp_bmp = null;
		window.Repaint();
	}
	
	this.get = function() {
		if (!this.xmlhttp) this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		var fn = this.filename;
		var func = function() {
			if (!p.save(li.xmlhttp.responsetext, fn)) return;
			li.update();
		}
		switch(this.mode) {
			case "lastfm_charts":
				if (l.username.length == 0) return(p.console(l.username_error));
				var url = l.get_url() + "&method=user." + this.lastfm_charts_methods[this.lastfm_charts_mode] + "&period=" + this.lastfm_charts_periods[this.lastfm_charts_period];
				var user_agent = l.user_agent;
				break;
			case "lastfm":
				if (this.artist == "" || this.artist == "?") return;
				var url = l.get_url() + "&method=" + this.lastfm_methods[this.lastfm_mode] + "&artist=" + encodeURIComponent(this.artist) + "&autocorrect=" + (l.auto_correct ? 1 : 0);
				var user_agent = l.user_agent;
				break;
			case "musicbrainz":
				var fn1 = this.folder + "\\MUSICBRAINZ_ARTISTID.txt";
				this.musicbrainz_id = p.eval("$if3(%musicbrainz_artistid%,%musicbrainz artist id%,)");
				this.musicbrainz_id = this.musicbrainz_id.substring(0, 36);
				if (this.musicbrainz_id.length == 0) this.musicbrainz_id = p.open(fn1);
				if (this.musicbrainz_id.length == 0) {
					func = function() {
						var json_data = p.json_parse(li.xmlhttp.responsetext);
						if (!json_data) return;
						var artist = li.musicbrainz_tidy(li.artist);
						var artists = json_data.artists || [];
						for (i = 0; i < artists.length; i++) {
							if (artist == li.musicbrainz_tidy(artists[i].name)) {
								if (!p.save(artists[i].id, fn1)) return;
								li.get();
								break;
							}
						}
					}
					
					if (this.artist == "" || this.artist == "?") return;
					var url = "https://musicbrainz.org/ws/2/artist/?query=artist:" + encodeURIComponent(this.musicbrainz_escape(this.artist)) + "&fmt=json";
				} else {
					if (this.musicbrainz_mode == "releases") var url = "https://musicbrainz.org/ws/2/release-group?artist=" + this.musicbrainz_id + "&limit=100&offset=0&fmt=json";
					else var url = "https://musicbrainz.org/ws/2/artist/" + this.musicbrainz_id + "?inc=url-rels&fmt=json";
				}
				var user_agent = "foobar2000_wsh_panel_mod_musicbrainz +http://www.hydrogenaud.io/forums/index.php?showuser=19379";
				break;
			case "echonest":
				if (this.artist == "" || this.artist == "?") return;
				var url = "http://developer.echonest.com/api/v4/artist/" + this.echonest_modes[this.echonest_mode] + "/?name=" + encodeURIComponent(this.artist) + "&api_key=EKWS4ESQLKN3G2ZWV";
				var user_agent = "";
				break;
			default:
				return;
		}
		this.xmlhttp.open("GET", url, true);
		this.xmlhttp.setRequestHeader("User-Agent", user_agent);
		this.xmlhttp.send();
		this.xmlhttp.onreadystatechange = function() {
			if (li.xmlhttp.readyState == 4) {
				if (li.xmlhttp.status == 200) {
					func();
				} else {
					p.console(li.xmlhttp.responsetext || "HTTP error: " + li.xmlhttp.status);
				}
			}
		}
	}
	
	this.init = function() {
		switch(true) {
			case p.check_feature("item_details"): //keep so old scripts still work
			case p.check_feature("properties"):
				this.mode = "properties";
				this.text_x = 180;
				break;
			case p.check_feature("lastfm_charts"):
				this.mode = "lastfm_charts";
				this.text_x = 20;
				this.lastfm_charts_modes = ["artist", "album", "track"];
				this.lastfm_charts_mode = window.GetProperty("lastfm_charts_mode", 0);
				this.lastfm_charts_methods = ["getTopArtists", "getTopAlbums", "getTopTracks"];
				this.lastfm_charts_periods_display = ["overall", "last 7 days", "1 month", "3 month", "6 month", "12 month"];
				this.lastfm_charts_periods = ["overall", "7day", "1month", "3month", "6month", "12month"];
				this.lastfm_charts_period = window.GetProperty("lastfm_charts_period", 0);
				this.lastfm_charts_bar_colour = window.GetProperty("lastfm_charts_bar_colour", "72-127-221");
				this.lastfm_link = window.GetProperty("lastfm_link", "last.fm");
				this.folder = p.data_folder + "charts";
				if (!p.fso.FolderExists(this.folder)) p.fso.CreateFolder(this.folder);
				l.need_username = true;
				break;
			case p.check_feature("lastfm"):
				this.mode = "lastfm";
				this.lastfm_methods = ["artist.getSimilar", "artist.getTopTags", "artist.getTopFans", "artist.getTopAlbums", "artist.getTopTracks"];
				this.lastfm_modes = ["similar artists", "top tags", "top fans", "top albums", "top tracks"];
				this.lastfm_mode = window.GetProperty("lastfm_mode", 0);
				this.lastfm_link = window.GetProperty("lastfm_link", "last.fm");
				break;
			case p.check_feature("musicbrainz"):
				this.musicbrainz_tidy = function(t) {
					return t.replace(/'/g, "’").toLowerCase();
				}
				
				this.musicbrainz_escape = function(t) {
					return t.replace(/[+!(){}\[\]^"~*?:\\\/-]/g, "\\$&");
				}
				
				this.musicbrainz_images = {
					"viaf.org": gdi.Image(p.images_path + "viaf_small.png"),
					"allmusic.com": gdi.Image(p.images_path + "allmusic_small.png"),
					"external": gdi.Image(p.images_path + "external_small.png"),
					"bbc.co.uk": gdi.Image(p.images_path + "bbc_small.png"),
					"facebook.com": gdi.Image(p.images_path + "facebook_small.png"),
					"home": gdi.Image(p.images_path + "home_small.png"),
					"last.fm": gdi.Image(p.images_path + "lastfm_small.png"),
					"twitter.com": gdi.Image(p.images_path + "twitter_small.png"),
					"soundcloud.com": gdi.Image(p.images_path + "soundcloud_small.png"),
					"wikipedia.org": gdi.Image(p.images_path + "wikipedia_small.png"),
					"discogs.com": gdi.Image(p.images_path + "discogs_small.png"),
					"myspace.com": gdi.Image(p.images_path + "myspace_small.png"),
					"youtube.com": gdi.Image(p.images_path + "youtube_small.png"),
					"imdb.com": gdi.Image(p.images_path + "imdb_small.png"),
					"plus.google.com": gdi.Image(p.images_path + "google_plus_small.png"),
					"lyrics.wikia.com": gdi.Image(p.images_path + "lyrics_wikia_small.png"),
					"flickr.com": gdi.Image(p.images_path + "flickr_small.png"),
					"secondhandsongs.com": gdi.Image(p.images_path + "secondhandsongs_small.png"),
					"vimeo.com": gdi.Image(p.images_path + "vimeo_small.png"),
					"rateyourmusic.com": gdi.Image(p.images_path + "rateyourmusic_small.png"),
					"instagram.com": gdi.Image(p.images_path + "instagram_small.png"),
					"tumblr.com": gdi.Image(p.images_path + "tumblr_small.png"),
					"decoda.com": gdi.Image(p.images_path + "decoda_small.png"),
					"wikidata.org": gdi.Image(p.images_path + "wikidata_small.png")
				}
				
				this.mode = "musicbrainz";
				this.musicbrainz_mode = window.GetProperty("musicbrainz_mode", "releases");
				this.musicbrainz_show_release_type = window.GetProperty("musicbrainz_show_release_type", true);
				this.musicbrainz_live = window.GetProperty("musicbrainz_live", true);
				this.musicbrainz_ep = window.GetProperty("musicbrainz_ep", true);
				this.musicbrainz_single = window.GetProperty("musicbrainz_single", true);
				this.musicbrainz_album = window.GetProperty("musicbrainz_album", true);
				this.musicbrainz_remix = window.GetProperty("musicbrainz_remix", true);
				this.musicbrainz_compilation = window.GetProperty("musicbrainz_compilation", true);
				this.musicbrainz_icons = window.GetProperty("musicbrainz_icons", true);
				this.reverse_sort = window.GetProperty("reverse_sort", true);
				break;
			case p.check_feature("echonest"):
				this.mode = "echonest";
				this.echonest_modes = ["news", "reviews", "blogs"];
				this.echonest_mode = window.GetProperty("echonest_mode", 0);
				break;
			case p.check_feature("autoplaylists"):
				this.autoplaylists_add = function() {
					if (this.autoplaylists_editing) return;
					this.autoplaylists_editing = true;
					var new_name = p.InputBox("Enter a name for your autoplaylist", p.name, "");
					if (new_name == "") { this.autoplaylists_editing = false; return; }
					var new_query = p.InputBox("Enter your autoplaylist query", p.name, "");
					if (new_query == "") { this.autoplaylists_editing = false; return; }
					var new_sort = p.InputBox("Enter a sort pattern\n\n(optional)", p.name, "");
					var new_force = new_sort.length > 0 ? p.MsgBox("Force sort?", 4, p.name) : 7;
					this.data.push(new_name + "¬" + new_query + "¬" + new_sort + "¬" + new_force);
					if (this.data.length > this.rows) this.offset = this.data.length - this.rows;
					p.save(this.data.join("\n"), this.filename);
					if (this.autoplaylists_success) this.autoplaylists_run(new_name, new_query, new_sort, new_force);
					window.NotifyOthers("autoplaylists", "update");
					this.update();
					this.autoplaylists_editing = false;
				}
				
				this.autoplaylists_run = function(n, q, s, f) {
					if (this.autoplaylists_remove_duplicates) {
						var i = 0;
						while(i < fb.PlaylistCount) {
							if (fb.GetPlaylistName(i) == n) fb.RemovePlaylist(i);
							else i++;
						}
					}
					fb.CreateAutoPlaylist(fb.PlaylistCount, n, q, s, f == 6 ? true : false);
					fb.ActivePlaylist = fb.PlaylistCount - 1;
				}
				
				this.autoplaylists_edit = function(x, y) {
					var _menu = window.CreatePopupMenu();
					var i = this.index;
					_menu.AppendMenuItem(MF_STRING, 1, "Rename...");
					_menu.AppendMenuItem(MF_STRING, 2, "Edit query...");
					_menu.AppendMenuItem(MF_STRING, 3, "Edit sort pattern...");
					_menu.AppendMenuItem(MF_STRING, 4, "Force Sort");
					_menu.CheckMenuItem(4, this.forced[i] == 6 ? true : false);
					this.autoplaylists_editing = true;
					this.autoplaylists_hover = false;
					window.RepaintRect(this.x + this.w - 40, this.y + 15, 40, Math.min(this.rows, this.items) * this.row_height);
					idx = _menu.TrackPopupMenu(x, y);
					switch(idx) {
						case 0:
							this.autoplaylists_editing = false;
							_menu.Dispose();
							return;
						case 1:
							var new_name = p.InputBox("Rename your autoplaylist", p.name, this.names[i]);
							if (new_name != "") this.names[i] = new_name;
							break;
						case 2:
							var new_query = p.InputBox("Enter your autoplaylist query", p.name, this.queries[i]);
							if (new_query != "") this.queries[i] = new_query;
							break;
						case 3:
							var new_sort = p.InputBox("Enter a sort pattern\n\n(optional)", p.name, this.sorts[i]);
							this.sorts[i] = new_sort;
							this.forced[i] = new_sort.length > 0 ? p.MsgBox("Force sort?", 4, p.name) : 7;
							break;
						case 4:
							this.forced[i] = this.forced[i] == 6 ? 7 : 6;
							break;
					}
					_menu.Dispose();
					var temp = this.names[i] + "¬" + this.queries[i] + "¬" + this.sorts[i] + "¬" + this.forced[i];
					if (this.data[i] != temp) {
						this.data[i] = temp;
						p.save(this.data.join("\n"), this.filename);
						if (this.autoplaylists_success) this.autoplaylists_run(this.names[i], this.queries[i], this.sorts[i], this.forced[i]);
						window.NotifyOthers("autoplaylists", "update");
						this.update();
					}
					this.autoplaylists_editing = false;
				}
				
				this.autoplaylists_delete = function() {
					if (this.offset > 1) this.offset--;
					this.autoplaylists_deleted_items.unshift(this.data[this.index]);
					this.data.splice(this.index, 1);
					p.save(this.data.join("\n"), this.filename);
					window.NotifyOthers("autoplaylists", "update");
					this.update();
				}
				
				this.mode = "autoplaylists";
				this.autoplaylists_del_img = gdi.Image(p.images_path + "cross.png");
				this.autoplaylists_edit_img = gdi.Image(p.images_path + "edit.png");
				this.autoplaylists_hover = false;
				this.autoplaylists_editing = false;
				this.autoplaylists_remove_duplicates = window.GetProperty("autoplaylists_remove_duplicates", true);
				this.autoplaylists_success = window.GetProperty("autoplaylists_success", true);
				this.autoplaylists_title = window.GetProperty("autoplaylists_title", "Autoplaylists");
				this.autoplaylists_slot = window.GetProperty("autoplaylists_slot", 1);
				this.filename = p.settings_folder + "autoplaylists" + this.autoplaylists_slot;
				this.autoplaylists_deleted_items = [];
				break;
		}
	}
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.index = 0;
	this.offset = 0;
	this.items = 0;
	this.text = "";
	this.artist = "";
	this.url = "";
	this.text_x = 0;
	this.init();
}

function playcount_sync() {
	this.playback_time = function() {
		this.time_elapsed++;
		if (this.time_elapsed == 3 && this.auto_love && fb.TitleFormat(this.auto_love_tf).Eval() == 1 && this.old_userloved == 0) {
			p.console("Automatically loving this track....");
			this.love_track();
		}
		if (this.time_elapsed == this.target_time) {
			if (!this.library || fb.IsMetadbInMediaLibrary(p.metadb)) {
				switch(true) {
					case this.loved_working || this.playcount_working:
						return;
					case !utils.CheckComponent("foo_customdb", true):
						p.console("Not contacting Last.fm. foo_customdb is missing.");
						return;
					default:
						p.console("Contacting Last.fm....");
						this.get(l.get_url() + "&method=track.getinfo&artist=" + encodeURIComponent(this.artist) + "&track=" + encodeURIComponent(this.track) + "&autocorrect=" + (l.auto_correct ? 1 : 0), function() {
							ps.update_track();
						});
				}
			} else {
				p.console("Skipping... Track not in library.");
			}
		}
	}
	
	this.metadb_changed = function() {
		if (!p.metadb) return false;
		this.artist = fb.TitleFormat(p.artist_tf).EvalWithMetadb(p.metadb);
		this.track = fb.TitleFormat("%title%").EvalWithMetadb(p.metadb);
		this.old_userloved = fb.TitleFormat("%LASTFM_LOVED_DB%").EvalWithMetadb(p.metadb) == 1 ? 1 : 0;
		this.old_userplaycount = fb.TitleFormat("%LASTFM_PLAYCOUNT_DB%").EvalWithMetadb(p.metadb);
		this.method = this.old_userloved == 1 ? "track.unlove" : "track.love";
		this.tooltip = (this.old_userloved == 1 ? "Unlove" : "Love") + " \"" + this.track + "\" by \"" + this.artist + "\".";
		this.crc32 = fb.TitleFormat("$crc32($lower(%artist%%title%))").EvalWithMetadb(p.metadb);
		b.update();
		return true;
	}
	
	this.playback_new_track = function() {
		this.auto_love_count = 0;
		this.time_elapsed = 0;
		switch(true) {
			case fb.PlaybackLength == 0:
				this.target_time = 240;
				break;
			case fb.PlaybackLength >= 30:
				this.target_time = Math.min(Math.floor(fb.PlaybackLength / 2), 240);
				break;
			default:
				this.target_time = 5;
				break;
		}
		p.item_focus_change();
	}
	
	this.playback_edited = function() {
		if (this.auto_love && fb.TitleFormat(this.auto_love_tf).Eval() == 1 && this.old_userloved == 0 && this.auto_love_count == 0) {
			this.auto_love_count = 1;
			p.console("Automatically loving this track....");
			this.love_track();
		}
	}
	
	this.tf = function(value) {
		return(value.replace(/'/g, "''").replace(/[\(\)\[\],]/g, "'$&'"));
	}
	
	this.love_track = function() {
		l.post(this.method, p.metadb);
	}
	
	this.get = function(url, func) {
		if (l.username.length == 0) {
			this.loved_working = false;
			this.playcount_working = false;
			p.console(l.username_error);
			return;
		}
		this.xmlhttp.open("GET", url, true);
		this.xmlhttp.setRequestHeader("User-Agent", l.user_agent);
		this.xmlhttp.send();
		this.xmlhttp.onreadystatechange = function() {
			if (ps.xmlhttp.readyState == 4) {
				if (ps.xmlhttp.status == 200) {
					func();
				} else {
					p.console(ps.xmlhttp.responsetext || "HTTP error: " + ps.xmlhttp.status);
				}
			}
		}
	}
	
	this.update_track = function() {
		this.json_data = p.json_parse(ps.xmlhttp.responsetext);
		if (!this.json_data || this.json_data.error > 0 || !this.json_data.track) {
			p.console(ps.xmlhttp.responsetext);
			return;
		}
		this.userplaycount = this.json_data.track.userplaycount > 0 ? ++this.json_data.track.userplaycount : 1;
		this.userloved = this.json_data.track.userloved == 1 ? 1 : 0;
		switch(true) {
			case fb.PlaybackLength < 30:
			case fb.PlaybackLength > 10800:
				fb.RunContextCommandWithMetadb("Customdb Love " + this.userloved, p.metadb, 8);
				break;
			case this.userplaycount < this.old_userplaycount:
				p.console("Playcount returned from Last.fm is lower than current value. Not updating.");
				fb.RunContextCommandWithMetadb("Customdb Love " + this.userloved, p.metadb, 8);
				break;
			case this.old_userplaycount == this.userplaycount:
				p.console("No changes found. Not updating.");
				fb.RunContextCommandWithMetadb("Customdb Love " + this.userloved, p.metadb, 8);
				break;
			default:
				p.console("Last.fm responded ok. Attempting to update playcount...");
				if (this.logging) {
					p.console("Old value: " + this.old_userplaycount);
					p.console("New value: " + this.userplaycount);
				}
				fb.RunContextCommandWithMetadb("Customdb Delete Playcount", p.metadb, 8);
				fb.RunContextCommandWithMetadb("Customdb Love 0", p.metadb, 8);
				window.SetTimeout(function() {
					var attempt = 1;
					while(fb.TitleFormat("%LASTFM_PLAYCOUNT_DB%").EvalWithMetadb(p.metadb) != ps.userplaycount && attempt <= 5) {
						if (ps.logging) p.console("Attempt: " + attempt);
						var query1 = '\"INSERT INTO quicktag(url,subsong,fieldname,value) VALUES(\\"' + ps.crc32 + '\\",\\"-1\\",\\"LASTFM_PLAYCOUNT_DB\\",\\"' + ps.userplaycount + '\\")\";';
						p.WshShell.Run(p.fso.GetFile(p.script_path + "sqlite3.exe").ShortPath + " " + p.fso.GetFile(fb.ProfilePath + "customdb_sqlite.db").ShortPath + " " + query1, 0, true);
						attempt++;
					}
					fb.RunContextCommandWithMetadb("Customdb Refresh", p.metadb, 8);
					if (fb.TitleFormat("%LASTFM_PLAYCOUNT_DB%").EvalWithMetadb(p.metadb) == ps.userplaycount) p.console("Playcount updated successfully.");
					else p.console("Database error. Playcount not updated.");
					if (ps.userloved == 1) fb.RunContextCommandWithMetadb("Customdb Love 1", p.metadb, 8);
				}, 100);
				break;
		}
	}
	
	this.start_import = function() {
		if (this.show_console) fb.ShowConsole();
		this.loved_page_errors = 0;
		this.playcount_page_errors = 0;
		this.pages = 0;
		this.r = 1;
		this.sql = "BEGIN TRANSACTION;\n";
		this.loved_working = true;
		this.sync_loved(1);
	}
	
	this.sync_loved = function(page) {
		if (!this.loved_working) return(p.console("Import aborted."));
		this.page = page;
		this.get(l.get_url() + "&method=user.getlovedtracks&limit=200&page=" + this.page, function() {
			ps.update_loved();
		});
	}
	
	this.update_loved = function() {
		this.json_data = p.json_parse(ps.xmlhttp.responsetext);
		if (!this.json_data || this.json_data.error > 0) {
			this.loved_page_errors++;
		} else if (this.json_data.lovedtracks && this.json_data.lovedtracks.track) {
			if (this.page == 1) this.pages = this.json_data.lovedtracks["@attr"].totalPages;
			for (i = 0; i < this.json_data.lovedtracks.track.length; i++) {
				var data = [];
				data[0] = this.json_data.lovedtracks.track[i].artist.name;
				data[1] = this.json_data.lovedtracks.track[i].name;
				data[2] = 1;
				if (data.length == 3) {
					p.console(this.r + ": " + data[0] + " - " + data[1]);
					var url = fb.TitleFormat("$crc32($lower(" + this.tf(data[0]) + this.tf(data[1]) + "))").Eval(true);
					this.sql += 'INSERT OR REPLACE INTO quicktag(url,subsong,fieldname,value) VALUES("' + url + '","-1","LASTFM_LOVED_DB","' + data[2] + '");' + "\n";
					this.r++;
				}
			}
			p.console("Loved tracks: completed page " + this.page + " of " + this.pages);
		} else if (this.pages > 0) {
			this.loved_page_errors++;
		}
		if (this.page < this.pages) {
			this.page++;
			this.sync_loved(this.page);
		} else {
			this.loved_working = false;
			if (this.full_import) {
				this.playcount_working = true;
				this.pages = 0;
				this.r = 1;
				this.sync_playcount(1);
			} else {
				try {
					this.sql += "COMMIT;"
					var ts = p.fso.OpenTextFile(this.sql_file, 2, true, 0);
					ts.WriteLine(this.sql);
					ts.Close();
					this.finish_import();
				} catch(e) {
				}
				if (this.loved_page_errors > 0) {
					p.console("Loved track page errors: " + this.loved_page_errors + " (200 records are lost for every page that fails.)");
				} else {
					p.console("There were no errors reported.");
				}
			}
		}
	}
	
	this.sync_playcount = function(page) {
		if (this.playcount_working == false) return(p.console("Import aborted."));
		this.page = page;
		this.get(l.get_url() + "&method=library.gettracks&limit=100&page=" + this.page, function() {
			ps.update_playcount();
		});
	}
	
	this.update_playcount = function() {
		this.json_data = p.json_parse(ps.xmlhttp.responsetext);
		if (!this.json_data || this.json_data.error > 0) {
			this.playcount_page_errors++;
		} else if (this.json_data.tracks && this.json_data.tracks.track) {
			if (this.page == 1) this.pages = this.json_data.tracks["@attr"].totalPages
			for (i = 0; i < this.json_data.tracks.track.length; i++) {
				var data = [];
				data[0] = this.json_data.tracks.track[i].artist.name;
				data[1] = this.json_data.tracks.track[i].name;
				data[2] = this.json_data.tracks.track[i].playcount;
				if (data[2] == 0) {
					this.page = this.pages;
					break;
				}
				if (data.length == 3) {
					p.console(this.r + ": " + data[0] + " - " + data[1] + " " + data[2]);
					var url = fb.TitleFormat("$crc32($lower(" + this.tf(data[0]) + this.tf(data[1]) + "))").Eval(true);
					this.sql += 'INSERT OR REPLACE INTO quicktag(url,subsong,fieldname,value) VALUES("' + url + '","-1","LASTFM_PLAYCOUNT_DB","' + data[2] + '");' + "\n";
					this.r++;
				}
			}
			p.console("Playcount: completed page " + this.page + " of " + this.pages);
		} else if (this.pages > 0) {
			this.playcount_page_errors++;
		}
		if (this.page < this.pages) {
			this.page++;
			this.sync_playcount(this.page);
		} else {
			try {
				this.sql += "COMMIT;"
				var ts = p.fso.OpenTextFile(this.sql_file, 2, true, 0);
				ts.WriteLine(this.sql);
				ts.Close();
				this.finish_import();
			} catch(e) {
			}
			this.playcount_working = false;
			if (this.loved_page_errors + this.playcount_page_errors > 0) {
				p.console("Loved track page errors: " + this.loved_page_errors + " (200 records are lost for every page that fails.)");
				p.console("Playcount page errors: " + this.playcount_page_errors + " (100 records are lost for every page that fails.)");
			} else {
				p.console("There were no errors reported.");
			}
		}
	}
	
	this.finish_import = function() {
		try {
			var cmd_file = p.fso.GetFile(p.script_path + "lastfm_sql.cmd").ShortPath;
			var db_file = p.fso.GetFile(fb.ProfilePath + "customdb_sqlite.db").ShortPath;
			p.run(cmd_file + " " + p.fso.GetFile(p.script_path + "sqlite3.exe").ShortPath + " " + db_file + " " + p.fso.GetFile(this.sql_file).ShortPath);
		} catch(e) {
		}
	}
	
	this.update_button = function() {
		var exclamation = this.icon == "tango" ? "exclamation.png" : "exclamation_small.png";
		var love = this.icon == "tango" ? "love.png" : "love_small.png";
		var love_h = this.icon == "tango" ? "love_h.png" : "love_h_small.png";
		this.size = this.icon == "tango" ? 32 : 20;
		switch(true) {
			case l.username.length == 0:
				this.n = exclamation;
				this.h = exclamation;
				this.tooltip = l.username_error;
				this.func = null;
				break;
			case l.sk.length != 32:
				this.n = exclamation;
				this.h = exclamation;
				this.tooltip = l.password_error;
				this.func = null;
				break;
			case !p.metadb:
				this.n = exclamation;
				this.h = exclamation;
				this.tooltip = "No selection";
				this.func = null;
				break;
			case !utils.CheckComponent("foo_customdb", true):
				this.n = exclamation;
				this.h = exclamation;
				this.tooltip = "The foo_customdb component is not installed. Please refer to the readme.";
				this.func = null;
				break;
			default:
				this.n = this.old_userloved == 1 ? love_h : love;
				this.h = this.old_userloved == 1 ? love : love_h;
				this.func = function() { ps.love_track(); }
				break;
		}
	}
	
	this.loved_working = false;
	this.playcount_working = false;
	this.sql_file = p.data_folder + "lastfm.sql";
	this.page = 0;
	this.last_page = 0;
	this.auto_love = window.GetProperty("playcount_sync_auto_love", false);
	this.auto_love_tf = window.GetProperty("playcount_sync_auto_love_tf", "");
	this.icon = window.GetProperty("playcount_sync_icon", "tango");
	this.show_console = window.GetProperty("playcount_sync_show_console", true);
	this.library = window.GetProperty("playcount_sync_library", false);
	this.logging = window.GetProperty("playcount_sync_logging", false);
	this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	l.need_username = true;
	window.SetInterval(function() {
		var temp = ps.page > 1 ? ps.page - 1 : 1;
		if (ps.loved_working && ps.page == ps.last_page) {
			ps.xmlhttp.abort();
			ps.sync_loved(temp);
		} else if (ps.playcount_working && ps.page == ps.last_page) {
			ps.xmlhttp.abort();
			ps.sync_playcount(temp);
		} else {
			ps.last_page = ps.page;
		}
	}, 15000);
}

function rating(x, y, bs) {
	this.draw = function(gr) {
		if (!p.metadb) return;
		for (i = 1; i < 6; i++) {
			this.img = i > (this.hover ? this.lrating : this.rating) ? this.off_img : this.on_img;
			p.draw_image(gr, this.img, this.x + this.bs * (i - 1), this.y, this.bs, this.bs);
		}
	}
	
	this.metadb_changed = function() {
		if (!p.metadb) return false;
		this.hover = false;
		this.rating = p.eval("$if2(%rating%,0)");
		this.tiptext = p.eval(this.tiptext_tf);
		this.lrating = this.rating;
		window.RepaintRect(this.x, this.y, this.w, this.bs);
		return true;
	}
	
	this.trace = function(x, y) {
		return x > this.x - this.bs && x < this.x + (this.bs * 5) && y > this.y && y < this.y + this.bs;
	}
	
	this.move = function(x, y) {
		if (!this.trace(x, y)) {
			if (this.hover) this.leave();
			return false;
		}
		if (p.metadb) {
			if (x > this.x) p.tt(this.tiptext);
			this.hover = true;
			this.lrating = Math.ceil((x - this.x) / this.bs);
			window.RepaintRect(this.x, this.y, this.w, this.bs);
		}
		return true;
	}
	
	this.lbtn_up = function(x, y) {
		if (!this.trace(x, y)) return false;
		if (this.check) {
			if (this.lrating != this.rating && this.hover == 1) fb.RunContextCommandWithMetadb("Rating/" + (this.lrating == 0 ? "<not set>" : this.lrating), p.metadb, 8);
		} else {
			p.MsgBox(this.error_text, 0, p.name);
			p.browser("http://www.foobar2000.org/components/view/foo_playcount");
		}
		return true;
	}
	
	this.leave = function() {
		p.ttd();
		this.hover = false;
		window.RepaintRect(this.x, this.y, this.w, this.bs);
	}
	
	this.x = x;
	this.y = y;
	this.bs = bs;
	this.w = this.bs * 5;
	this.hover = false;
	this.rating = null;
	this.lrating = null;
	this.img = null;
	this.off_img = gdi.Image(p.images_path + "off.png");
	this.on_img = gdi.Image(p.images_path + "on.png");
	this.check = utils.CheckComponent("foo_playcount", true);
	this.error_text = "This script requires foo_playcount.";
	this.tiptext_tf = this.check ? 'Rate "%title%" by "%artist%"' : this.error_text;
}

function sb(x, y, w, h, img, isVisible, func) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.img = img;
	this.isVisible = new Function("return (" + isVisible + ");");
	this.func = func;
	
	this.draw = function(gr) {
		if (this.isVisible()) p.draw_image(gr, this.img, this.x, this.y, this.w, this.h);
	}
	
	this.trace = function(x, y) {
		return(x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h && this.isVisible());
	}
	
	this.lbtn_up = function(x, y) {
		if (!this.trace(x, y)) return false;
		this.func && this.func(x, y);
		return true;
	}
}

function seekbar(x, y, w, h) {
	this.draw = function(gr) {
		p.draw_background(gr);
		switch(this.mode) {
			case "spectrogram":
				if (this.working) {
					p.draw_image(gr, this.hourglass_img, this.x, this.y + Math.round((this.h - 32) / 2), this.w, 32);
				} else {
					p.draw_image(gr, this.img, this.x, this.y, this.w, this.h, "stretch");
				}
				if (fb.IsPlaying && fb.PlaybackLength > 0) {
					this.calc_pos();
					gr.FillSolidRect(this.x + this.pos - 2, this.y, 2, this.h, p.splitRGB(this.marker));
				}
				break;
			case "nyan_cat":
				if (fb.IsPlaying && fb.PlaybackLength > 0) {
					this.calc_pos();
					for (i = 0; i < this.offsets.length; i++) {
						gr.FillSolidRect(this.x - 48, this.y + this.offsets[i], this.pos + 2, this.heights[i], this.colours[i]);
					}
					p.draw_image(gr, this.cat_img[this.z], this.pos, this.y, 48, 30);
				} else {
					p.draw_image(gr, this.cat_img[0], 0, this.y, 48, 30);
				}
				break;
		}
	}
	
	this.playback_new_track = function() {
		if (this.mode != "spectrogram") return;
		var metadb = fb.GetNowPlaying();
		this.img && this.img.Dispose();
		this.img = null;
		try {
			this.png_filename = spectrogram_cache + "\\" + fb.TitleFormat("$crc32(%path%)").EvalWithMetadb(metadb) + this.sox_params + ".png";
			switch(true) {
				case !metadb:
				case metadb.RawPath.indexOf("file") != 0:
					p.console("Skipping... Not a valid file type.");
					break;
				case fb.PlaybackLength == 0:
					p.console("Skipping... Unknown length.");
					break;
				case fb.TitleFormat("$if($or($strcmp(%__cue_embedded%,yes),$strcmp($right(%path%,3),cue)),cue,)").EvalWithMetadb(metadb) == "cue":
					p.console("Skipping... Cannot support cuesheets.");
					break;
				case fb.TitleFormat("%subsong%").EvalWithMetadb(metadb) > 0:
					p.console("Skipping... Cannot support tracks with chapters.");
					break;
				case this.library && !fb.IsMetadbInMediaLibrary(metadb):
					p.console("Skipping... Track not in library.");
					break;
				case p.fso.FileExists(this.png_filename):
					this.img = gdi.Image(this.png_filename);
					break;
				default:
					this.working = true
					window.Repaint();
					var filename = metadb.Path;
					var length = fb.TitleFormat("%length%").EvalWithMetadb(metadb);
					var cmd = "cmd /c \"\"" + ffmpeg_exe + "\" -i \"" + filename + "\" -t " + length + " -f sox - | \"" + sox_exe + "\" -p -n " + this.sox_params + " -d " + length + " -r -o \"" + this.png_filename + "\"\"";
					try { p.WshShell.Run(cmd, 0, true); } catch(e) {}
					this.working = false;
					this.img = gdi.Image(this.png_filename);
					break;
			}
		} catch(e) {
		}
		window.Repaint();
	}
	
	this.playback_stop = function() {
		window.Repaint();
	}
	
	this.playback_seek = function() {
		this.update();
	}
	
	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y - (this.drag ? 200 : 0) && y < this.y + this.h + (this.drag ? 200 : 0));
	}
	
	this.wheel = function(step) {
		if (!this.trace(p.mx, p.my)) return false;
		p.ttd();
		switch(true) {
			case !fb.IsPlaying:
			case fb.PlaybackLength == 0:
				break;
			case fb.PlaybackLength < 60:
				fb.PlaybackTime += step * 5;
				break;
			case fb.PlaybackLength < 600:
				fb.PlaybackTime += step * 10;
				break;
			default:
				fb.PlaybackTime += step * 60;
				break;
		}
		return true;
	}
	
	this.move = function(x, y) {
		if (this.trace(x, y)) {
			if (fb.IsPlaying && fb.PlaybackLength > 0) {
				x -= this.x;
				this.drag_seek = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
				if (this.old_x != x || this.old_y != y) {
					this.old_x = x;
					this.old_y = y;
					p.tt(p.format_time(fb.PlaybackLength * this.drag_seek));
				}
				if (this.drag) this.update();
			}
			return true;
		} else {
			this.leave();
			return false;
		}
	}
	
	this.lbtn_down = function(x, y) {
		if (!this.trace(x, y)) return false;
		if (fb.IsPlaying && fb.PlaybackLength > 0) this.drag = true;
		return true;
	}
	
	this.lbtn_up = function(x, y) {
		if (!this.trace(x, y)) return false;
		if (this.drag) {
			this.drag = false;
			fb.PlaybackTime = fb.PlaybackLength * this.drag_seek;
		}
		return true;
	}
	
	this.leave = function() {
		this.drag = false;
		p.ttd();
	}
	
	this.update = function() {
		if (this.mode == "spectrogram") window.RepaintRect(Math.max(this.pos - 60, 0), this.y, 120, this.h);
		else window.RepaintRect(0, this.y, p.w, this.h);
	}
	
	this.calc_pos = function() {
		this.pos = this.drag ? this.w * this.drag_seek : this.w * (fb.PlaybackTime / fb.PlaybackLength);
	}
	
	this.init = function() {
		switch(true) {
			case p.check_feature("spectrogram"):
				this.clear_images = function(period) {
					var now = Date.parse(Date());
					var images = utils.Glob(spectrogram_cache + "\\*.*").toArray();
					for (i = 0; i < images.length; i++) {
						if (this.png_filename == images[i]) continue;
						if (now - Date.parse(p.fso.Getfile(images[i]).DateLastModified) > period) {
							p.delete_file(images[i]);
						}
					}
				}
				
				this.mode = "spectrogram";
				this.library = window.GetProperty("seekbar_library", false);
				this.marker = window.GetProperty("seekbar_marker", "240-240-240");
				this.sox_params = window.GetProperty("sox_params", "channels 1 spectrogram -Y 130").trim();
				this.working = false;
				this.img = false;
				if (!p.fso.FolderExists(spectrogram_cache)) p.fso.CreateFolder(spectrogram_cache);
				if (fb.IsPlaying) {
					window.SetTimeout(function() {
						s.playback_new_track();
					}, 100);
				}
				break;
			case p.check_feature("nyan_cat"):
				this.mode = "nyan_cat";
				this.cat_img = [gdi.Image(p.images_path + "\\seekbar cat.png"), gdi.Image(p.images_path + "\\seekbar cat 2.png")];
				this.offsets = [2, 6, 10, 15, 20, 24];
				this.heights = [4, 4, 5, 5, 4, 4];
				this.colours = [RGB(255, 0, 0), RGB(255, 153, 0), RGB(255, 255, 0), RGB(51, 255, 0), RGB(0, 153, 255), RGB(102, 51, 255)];
				break;
		}
	}
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.z = 0;
	this.pos = 0;
	this.drag = false;
	this.drag_seek = 0;
	this.old_x = 0;
	this.old_y = 0;
	this.hourglass_img = gdi.Image(p.images_path + "hourglass.png");
	this.init();
	window.SetInterval(function() {
		s.z = s.z == 0 ? 1 : 0;
		if (!fb.IsPlaying || fb.IsPaused || fb.PlaybackLength == 0) return;
		s.update();
	}, 150);
}

function text(x, y, w, h) {
	this.size = function() {
		this.rows = Math.floor((this.h - 30) / p.row_height);
		this.but_x = this.x + Math.round((this.w - 15) / 2);
		this.up_btn = new sb(this.but_x, this.y, 15, 15, p.up_img, "t.offset > 0", function() { t.wheel(1); });
		this.down_btn = new sb(this.but_x, this.y + this.h - 15, 15, 15, p.down_img, "t.offset < t.text_rows - t.rows", function() { t.wheel(-1); });
		this.calc();
	}
	
	this.draw = function(gr, colour) {
		for (i = 0; i < Math.min(this.rows, this.text_rows); i++) {
			if (this.centre) p.centre_text(gr, this.text_array[i + this.offset], this.fixed ? p.fixed_font : p.normal_font, colour || p.textcolour, this.x, 18 + this.y + (i * p.row_height), this.w, p.row_height);
			else p.left_text(gr, this.text_array[i + this.offset], this.fixed ? p.fixed_font : p.normal_font, colour || p.textcolour, this.x, 18 + this.y + (i * p.row_height), this.w, p.row_height);
		}
		this.up_btn.draw(gr);
		this.down_btn.draw(gr);
	}
	
	this.metadb_changed = function() {
		if (!p.metadb) return false;
		switch(this.mode) {
			case "allmusic":
				var temp_album = p.eval(this.allmusic_album_tf);
				var temp_artist = p.eval(this.allmusic_artist_tf);
				if (this.album == temp_album && this.artist == temp_artist) return false;
				this.artist = temp_artist;
				this.album = temp_album;
				this.folder = p.data_folder + p.eval("$crc32(" + this.allmusic_artist_tf + ")");
				if (!p.fso.FolderExists(this.folder)) p.fso.CreateFolder(this.folder);
				this.filename = this.folder + "\\Allmusic - " + p.clean_filename(this.album) + ".txt";
				this.text = "Nothing found.";
				if (p.fso.fileExists(this.filename)) {
					this.text = p.open(this.filename);
				} else {
					this.allmusic_search = "http://www.allmusic.com/search/albums/" + encodeURIComponent(this.album + " " + this.artist);
					this.allmusic_url = false;
					this.get();
				}
				break;
			case "lastfm_album":
				var temp_album = p.eval("[%album%]");
				var temp_artist = p.eval("[%album artist%]");
				if (this.album == temp_album && this.artist == temp_artist) return false;
				this.artist = temp_artist;
				this.album = temp_album;
				this.folder = p.data_folder + p.eval("$crc32(%album artist%)");
				if (!p.fso.FolderExists(this.folder)) p.fso.CreateFolder(this.folder);
				//delete old files
				p.delete_file(this.folder + "\\album.getInfo_" + p.eval("$crc32(%album%)") + ".json");
				this.filename = this.folder + "\\Last.fm - " + p.clean_filename(this.album) + ".json";
				this.text = "Nothing found.";
				if (p.fso.fileExists(this.filename)) {
					this.file = p.fso.GetFile(this.filename);
					this.json_text = p.open(this.filename);
					this.json_data = p.json_parse(this.json_text);
					if (this.json_data && this.json_data.album) {
						if (this.json_data.album.wiki && this.json_data.album.wiki.content) {
							this.text = p.strip_tags(this.json_data.album.wiki.content);
							this.text = this.text.replace("User-contributed text is available under the Creative Commons By-SA License and may also be available under the GNU FDL.", "").trim();
						}
					}
					if (Date.parse(Date()) - Date.parse(this.file.DateLastModified) > ONE_DAY) this.get();
				} else {
					this.get();
				}
				break;
			case "lastfm_wiki":
				p.artist = p.eval(p.artist_tf);
				if (this.artist == p.artist) return false;
				this.artist = p.artist;
				this.folder = p.data_folder + p.eval("$crc32(" + p.artist_tf + ")");
				if (!p.fso.FolderExists(this.folder)) p.fso.CreateFolder(this.folder);
				this.filename = this.folder + "\\artist.getInfo_mod.json";
				this.text = "Nothing found.";
				this.url = "http://www.last.fm/";
				if (p.fso.fileExists(this.filename)) {
					this.file = p.fso.GetFile(this.filename);
					this.json_text = p.open(this.filename);
					this.json_data = p.json_parse(this.json_text);
					if (this.json_data && this.json_data.response && this.json_data.response.biographies) {
						this.items = this.json_data.response.biographies.length;
						for (i = 0; i < this.items; i++) {
							if (this.json_data.response.biographies[i].site == this.source) {
								this.text = this.json_data.response.biographies[i].text;
								this.url = this.json_data.response.biographies[i].license["attribution-url"];
								break;
							}
						}
						if (this.source == "last.fm") this.text = this.text.replace(/\.  /g, ".\n\n");
						if (this.source == "wikipedia") this.text = this.text.replace(/\. \n/g, ".\n\n").replace(/\n\n\n/g, "\n\n").replace(/ edit:\n/g , ":\n").replace(/edit:\n/g , ":\n");
					}
					if (Date.parse(Date()) - Date.parse(this.file.DateLastModified) > ONE_DAY) this.get();
				} else {
					this.get();
				}
				break;
			case "simple_tag":
				this.temp_filename = p.metadb.Path;
				if (this.filename == this.temp_filename) return false;
				this.filename = this.temp_filename;
				this.text = p.eval(this.tag);
				break;
			case "simple_text":
				this.temp_filename = p.eval(this.filename_tf);
				if (this.filename == this.temp_filename) return false;
				this.text = "";
				this.filename = this.temp_filename;
				if (p.fso.FolderExists(this.filename)) {
					this.files = [];
					this.files = this.files.concat(utils.Glob(this.filename + "\\*.txt").toArray(), utils.Glob(this.filename + "\\*.log").toArray());
					this.files.sort();
					this.text = p.open(this.files[0]);
				} else {
					this.filenames = this.filename.split("|");
					for (i = 0; i < this.filenames.length; i++) {
						if (p.fso.fileExists(this.filenames[i])) {
							this.text = p.open(this.filenames[i]);
							break;
						}
					}
				}
				this.text = this.text.replace(/\t/g, "    ");
				break;
		}
		this.calc();
		window.Repaint();
		return true;
	}
	
	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}
	
	this.wheel = function(step) {
		if (!this.trace(p.mx, p.my)) return false;
		if (this.text_rows > this.rows) {
			this.offset -= step * 3;
			if (this.offset < 0) this.offset = 0;
			if (this.offset + this.rows > this.text_rows) this.offset = this.text_rows - this.rows;
			window.RepaintRect(this.x, this.y, this.w, this.h);
		}
		return true;
	}
	
	this.move = function(x, y) {
		switch(true) {
			case !this.trace(x, y):
				window.SetCursor(IDC_ARROW);
				return false;
			case this.up_btn.trace(x, y):
			case this.down_btn.trace(x, y):
				window.SetCursor(IDC_HAND);
				break;
			default:
				window.SetCursor(IDC_ARROW);
				break;
		}
		return true;
	}
	
	this.lbtn_up = function(x, y) {
		if (!this.trace(x, y)) return false;
		this.up_btn.lbtn_up(x, y);
		this.down_btn.lbtn_up(x, y);
		return true;
	}
	
	this.get = function() {
		var fn = this.filename;
		switch(this.mode) {
			case "allmusic":
				if (this.allmusic_url) {
					var func = function () {
						if (!t.doc) t.doc = new ActiveXObject("htmlfile");
						t.doc.open();
						var div = t.doc.createElement("div");
						div.innerHTML = t.xmlhttp.responsetext;
						var data = div.getElementsByTagName("div");
						for (i = 0; i < data.length; i++) {
							if (data[i].itemprop == "reviewBody") {
								var content = p.strip_tags(data[i].innerText);
								p.save(content, fn);
								t.text = content;
								t.calc();
								window.Repaint();
								break;
							}
						}
						t.doc.close();
					}
					
					var url = this.allmusic_url;
					this.allmusic_url = false;
				} else {
					var func = function() {
						var artist, title, divs, url, temp;
						var ar = t.tidy(t.artist);
						var al = t.tidy(t.album);
						if (!t.doc) t.doc = new ActiveXObject("htmlfile");
						t.doc.open();
						var div = t.doc.createElement("div");
						div.innerHTML = t.xmlhttp.responsetext;
						var data = div.getElementsByTagName("li");
						for (i = 0; i < data.length; i++) {
							if (data[i].className == "album") {
								divs = data[i].getElementsByTagName("div");
								title = "", artist = "";
								for (j = 0; j < divs.length; j++) {
									if (divs[j].className == "title") {
										title = divs[j].getElementsByTagName("a")[0].innerText;
										url = divs[j].getElementsByTagName("a")[0].href;
									}
									if (divs[j].className == "artist") {
										temp = divs[j].getElementsByTagName("a");
										if (temp.length > 0) artist = temp[0].innerText;
										else artist = "various artists";
									}
								}
								if (ar == t.tidy(artist) && al == t.tidy(title)) {
									t.allmusic_url = url;
									t.get();
									break;
								}
							}
						}
						t.doc.close();
					}
					
					if (this.artist == "" || this.artist == "?" || this.album == "" || this.album == "?") return;
					var url = this.allmusic_search;
				}
				var user_agent = "";
				break;
			case "lastfm_album":
				var func = function() {
					if (!p.save(t.xmlhttp.responsetext, fn)) return;
					t.artist = "";
					t.album = "";
					p.item_focus_change();
				}
				
				if (this.artist == "" || this.artist == "?" || this.album == "" || this.album == "?") return;
				var url = l.get_url() + "&method=album.getInfo&artist=" + encodeURIComponent(this.artist) + "&album=" + encodeURIComponent(this.album);
				var user_agent = l.user_agent;
				break;
			case "lastfm_wiki":
				var func = function() {
					if (!p.save(t.xmlhttp.responsetext, fn)) return;
					t.artist = "";
					p.item_focus_change();
				}
				
				if (this.artist == "" || this.artist == "?") return;
				var url = "http://developer.echonest.com/api/v4/artist/biographies?api_key=EKWS4ESQLKN3G2ZWV&format=json&name=" + encodeURIComponent(this.artist);
				var user_agent = "";
				break;
			default:
				return;
		}
		this.xmlhttp.open("GET", url, true);
		this.xmlhttp.setRequestHeader("User-Agent", user_agent);
		this.xmlhttp.send();
		this.xmlhttp.onreadystatechange = function() {
			if (t.xmlhttp.readyState == 4) {
				if (t.xmlhttp.status == 200) {
					func();
				} else {
					p.console(t.xmlhttp.responsetext || "HTTP error: " + t.xmlhttp.status);
				}
			}
		}
	}
	
	this.calc = function() {
		this.offset = 0;
		this.text_rows = 0;
		if (this.w < 100 || this.text.length == 0) return;
		var temp_bmp = gdi.CreateImage(1, 1);
		var temp_gr = temp_bmp.GetGraphics();
		var paragraphs = this.text.split("\n");
		this.text_array = [];
		for (i = 0; i < paragraphs.length; i++) {
			if (this.fixed) {
				this.text_array.push(paragraphs[i]);
			} else {
				var lines = temp_gr.EstimateLineWrap(paragraphs[i], p.normal_font, this.w).toArray();
				for (j = 0; j < lines.length; j += 2) {
					this.text_array.push(lines[j].trim());
				}
			}
		}
		this.text_rows = this.text_array.length;
		temp_bmp.ReleaseGraphics(temp_gr);
		temp_bmp.Dispose();
		temp_gr = null;
		temp_bmp = null;
	}
	
	this.init = function() {
		switch(true) {
			case p.check_feature("allmusic"):
				this.tidy = function(t) {
					return fb.TitleFormat("$replace($lower($ascii(" + t + ")), & ,, and ,)").Eval(true);
				}
				
				this.mode = "allmusic";
				this.allmusic_artist_tf = window.GetProperty("allmusic_artist_tf", "%album artist%");
				this.allmusic_album_tf = window.GetProperty("allmusic_album_tf", "%album%");
				break;
			case p.check_feature("lastfm_album"):
				this.mode = "lastfm_album";
				break;
			case p.check_feature("lastfm_wiki"):
				this.mode = "lastfm_wiki";
				this.source = window.GetProperty("biography_source", "last.fm");
				break;
			case p.check_feature("simple_text"):
				this.mode = "simple_text";
				this.title = window.GetProperty("text_title", "$directory_path(%path%)");
				this.filename_tf = window.GetProperty("text_filename_tf", "$directory_path(%path%)");
				this.filename = "";
				this.fixed = window.GetProperty("text_fixed_font", true);
				break;
			case p.check_feature("simple_tag"):
				this.mode = "simple_tag";
				this.title = window.GetProperty("text_title", "%title%");
				this.filename = "";
				this.centre = window.GetProperty("text_centre", false);
				this.tag = window.GetProperty("text_tag", "[%lyrics%]");
				break;
		}
	}
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.text = "";
	this.artist = "";
	this.album = "";
	this.url = "";
	this.fixed = false;
	this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	this.init();
	this.size();
}

function thumbs() {
	this.draw = function(gr) {
		switch(true) {
			case im.images.length == 0:
				break;
			case this.mode == "off":
				p.draw_image(gr, im.images[im.index], im.x, im.y, im.w, im.h, im.type);
				break;
			case !this.img:
				break;
			case this.mode == "grid":
				gr.DrawImage(this.img, this.x, this.y, this.w, this.h, 0, this.offset * this.px, this.w, this.h);
				if (this.overlay) {
					gr.FillSolidRect(this.x, this.y, this.w, this.h, RGBA(0, 0, 0, 126));
					p.draw_image(gr, im.images[im.index], im.x, im.y, im.w, im.h, "centre");
				}
				break;
			case this.mode == "left":
			case this.mode == "right":
				p.draw_image(gr, im.images[im.index], 0, 0, p.w, p.h, im.type);
				gr.FillSolidRect(this.x, this.y, this.px, this.h, RGBA(0, 0, 0, 126));
				gr.DrawImage(this.img, this.x, this.y, this.w, this.h, 0, this.offset * this.px, this.w, this.h);
				break;
			case this.mode == "bottom":
			case this.mode == "top":
				p.draw_image(gr, im.images[im.index], 0, 0, p.w, p.h, im.type);
				gr.FillSolidRect(this.x, this.y, this.w, this.px, RGBA(0, 0, 0, 126));
				gr.DrawImage(this.img, this.x, this.y, this.w, this.h, this.offset * this.px, 0, this.w, this.h);
				break;
		}
	}
	
	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	}
	
	this.wheel = function(step) {
		switch(true) {
			case !this.trace(p.mx, p.my):
			case this.overlay:
				return false;
			case this.mode == "grid":
				if (this.img_rows < this.rows) return true;
				this.offset -= step;
				if (this.offset < 0) this.offset = 0;
				if (this.offset > this.img_rows - this.rows) this.offset = this.img_rows - this.rows + 1;
				break;
			case this.mode == "left":
			case this.mode == "right":
				if (im.images.length < this.rows) return true;
				this.offset -= step;
				if (this.offset < 0) this.offset = 0;
				if (this.rows + this.offset > im.images.length) this.offset = im.images.length - this.rows + 1;
				break;
			case this.mode == "bottom":
			case this.mode == "top":
				if (im.images.length < this.columns) return true;
				this.offset -= step;
				if (this.offset < 0) this.offset = 0;
				if (this.columns + this.offset > im.images.length) this.offset = im.images.length - this.columns + 1;
				break;
		}
		window.RepaintRect(this.x, this.y, this.w, this.h);
		return true;
	}
	
	this.move = function(x, y) {
		switch(true) {
			case !this.trace(x, y):
				window.SetCursor(IDC_ARROW);
				return false;
			case this.overlay:
				window.SetCursor(IDC_ARROW);
				return true;
			case this.mode == "grid":
				this.index = Math.floor((x - this.x) / this.px) + (Math.floor((y - this.y) / this.px) * this.columns) + (this.offset * this.columns);
				break;
			case this.mode == "left":
			case this.mode == "right":
				this.index = Math.floor((y - this.y) / this.px) + this.offset;
				break;
			case this.mode == "bottom":
			case this.mode == "top":
				this.index = Math.floor((x - this.x) / this.px) + this.offset;
				break;
		}
		window.SetCursor(this.index < im.images.length ? IDC_HAND : IDC_ARROW);
		return true;
	}
	
	this.lbtn_up = function(x, y) {
		switch(true) {
			case !this.trace(x, y):
				return false;
			case this.mode == "grid" && this.overlay && im.trace(x, y):
				this.overlay = false;
				window.Repaint();
				break;
			case this.mode == "grid" && this.index < im.images.length && !this.overlay:
				this.overlay = true;
				im.index = this.index;
				window.Repaint();
				break;
			case this.overlay:
				break;
			case this.index < im.images.length:
				im.index = this.index;
				window.Repaint();
		}
		return true;
	}
	
	this.lbtn_dblclk = function(x, y) {
		if (!im.trace(x, y) || th.mode == "grid") return false;
		if (im.files.length > 0) p.run("\"" + im.files[im.index] + "\"");
		return true;
	}
	
	this.calc = function() {
		this.offset = 0;
		switch(true) {
			case p.w < this.px || p.h < this.px || this.mode == "off":
				this.nc = true;
				this.img && this.img.Dispose();
				this.img = null;
				im.x = 0;
				im.y = 0;
				im.w = p.w;
				im.h = p.h;
				break;
			case this.mode == "grid":
				this.x = 0;
				this.y = 0;
				this.w = p.w;
				this.h = p.h;
				im.x = 40;
				im.y = 40;
				im.w = this.w - 80;
				im.h = this.h - 80;
				if (!this.nc && this.columns != Math.floor(this.w / this.px)) this.nc = true;
				this.overlay = false;
				this.rows = Math.ceil(this.h / this.px);
				this.columns = Math.floor(this.w / this.px);
				this.img_rows = Math.ceil(im.images.length / this.columns);
				if (this.nc && im.images.length > 0) {
					this.nc = false;
					this.img && this.img.Dispose();
					this.img = null;
					this.img = gdi.CreateImage(Math.min(this.columns, im.images.length) * this.px, this.img_rows * this.px);
					var temp_gr = this.img.GetGraphics();
					temp_gr.SetInterpolationMode(7);
					var ci = 0;
					var row, col;
					for (row = 0; row < this.img_rows; row++) {
						for (col = 0; col < this.columns; col++) {
							if (ci == im.images.length) continue;
							p.draw_image(temp_gr, im.images[ci], col * this.px, row * this.px, this.px, this.px, "crop top");
							ci++;
						}
					}
					this.img.ReleaseGraphics(temp_gr);
					temp_gr = null;
				}
				break;
			case this.mode == "left":
			case this.mode == "right":
				this.x = this.mode == "left" ? 0 : p.w - this.px;
				this.y = 0;
				this.w = this.px;
				this.h = p.h;
				im.x = this.mode == "right" ? 0 : this.px;
				im.y = 0;
				im.w = p.w - this.px;
				im.h = p.h;
				this.rows = Math.ceil(this.h / this.px);
				if (this.nc && im.images.length > 0) {
					this.nc = false;
					this.img && this.img.Dispose();
					this.img = null;
					this.img = gdi.CreateImage(this.px, this.px * im.images.length);
					var temp_gr = this.img.GetGraphics();
					temp_gr.SetInterpolationMode(7);
					for (i = 0; i < im.images.length; i++) {
						p.draw_image(temp_gr, im.images[i], 0, i * this.px, this.px, this.px, "crop top");
					}
					this.img.ReleaseGraphics(temp_gr);
					temp_gr = null;
				}
				break;
			case this.mode == "bottom":
			case this.mode == "top":
				this.x = 0;
				this.y = this.mode == "top" ? 0 : p.h - this.px;
				this.w = p.w;
				this.h = this.px;
				im.x = 0;
				im.y = this.mode == "bottom" ? 0 : this.px;
				im.w = p.w;
				im.h = p.h - this.px;
				this.columns = Math.ceil(this.w / this.px);
				if (this.nc && im.images.length > 0) {
					this.nc = false;
					this.img && this.img.Dispose();
					this.img = null;
					this.img = gdi.CreateImage(this.px * im.images.length, this.px);
					var temp_gr = this.img.GetGraphics();
					temp_gr.SetInterpolationMode(7);
					for (i = 0; i < im.images.length; i++) {
						p.draw_image(temp_gr, im.images[i], i * this.px, 0, this.px, this.px, "crop top");
					}
					this.img.ReleaseGraphics(temp_gr);
					temp_gr = null;
				}
				break;
		}
	}
	
	this.nc = false;
	this.mode = window.GetProperty("thumbs_mode", p.check_feature("now_playing") ? "off" : "bottom");
	this.px = window.GetProperty("thumbs_px", 100);
	this.img = null;
}

function volume(x, y, w, h) {
	this.volume_change = function(val) {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	}

	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y - (this.drag ? 200 : 0) && y < this.y + this.h + (this.drag ? 200 : 0));
	}
	
	this.move = function(x, y) {
		if (this.trace(x, y)) {
			x -= this.x;
			var pos = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
			this.drag_vol = 50 * Math.log(0.99 * pos + 0.01) / Math.LN10;
			p.tt(this.drag_vol.toFixed(2) + " dB");
			if (this.drag) fb.Volume = this.drag_vol;
			return true;
		} else {
			this.leave();
			return false;
		}
	}
	
	this.wheel = function(step) {
		p.ttd();
		fb.Volume += step;
	}
	
	this.lbtn_down = function(x, y) {
		if (!this.trace(x, y)) return false;
		this.drag = true;
		return true;
	}
	
	this.lbtn_up = function(x, y) {
		if (!this.trace(x, y)) return false;
		this.drag = false;
		return true;
	}
	
	this.leave = function() {
		this.drag = false;
		p.ttd();
	}
	
	this.calc_pos = function() {
		this.pos = this.w * (Math.pow(10, fb.Volume / 50) - 0.01) / 0.99;
	}
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.pos = 0;
	this.drag = false;
	this.drag_vol = 0;
}

/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
var hexcase=0;function hex_md5(a){return rstr2hex(rstr_md5(str2rstr_utf8(a)))}
function hex_hmac_md5(a,b){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a),str2rstr_utf8(b)))}
function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72"}
function rstr_md5(a){return binl2rstr(binl_md5(rstr2binl(a),a.length*8))}
function rstr_hmac_md5(c,f){var e=rstr2binl(c);if(e.length>16){e=binl_md5(e,c.length*8)}
var a=Array(16),d=Array(16);for(var b=0;b<16;b++){a[b]=e[b]^909522486;d[b]=e[b]^1549556828}
var g=binl_md5(a.concat(rstr2binl(f)),512+f.length*8);return binl2rstr(binl_md5(d.concat(g),512+128))}
function rstr2hex(c){try{hexcase}catch(g){hexcase=0}
var f=hexcase?"0123456789ABCDEF":"0123456789abcdef";var b="";var a;for(var d=0;d<c.length;d++){a=c.charCodeAt(d);b+=f.charAt((a>>>4)&15)+f.charAt(a&15)}
return b}
function str2rstr_utf8(c){var b="";var d=-1;var a,e;while(++d<c.length){a=c.charCodeAt(d);e=d+1<c.length?c.charCodeAt(d+1):0;if(55296<=a&&a<=56319&&56320<=e&&e<=57343){a=65536+((a&1023)<<10)+(e&1023);d++}
if(a<=127){b+=String.fromCharCode(a)}else{if(a<=2047){b+=String.fromCharCode(192|((a>>>6)&31),128|(a&63))}else{if(a<=65535){b+=String.fromCharCode(224|((a>>>12)&15),128|((a>>>6)&63),128|(a&63))}else{if(a<=2097151){b+=String.fromCharCode(240|((a>>>18)&7),128|((a>>>12)&63),128|((a>>>6)&63),128|(a&63))}}}}}
return b}
function rstr2binl(b){var a=Array(b.length>>2);for(var c=0;c<a.length;c++){a[c]=0}
for(var c=0;c<b.length*8;c+=8){a[c>>5]|=(b.charCodeAt(c/8)&255)<<(c%32)}
return a}
function binl2rstr(b){var a="";for(var c=0;c<b.length*32;c+=8){a+=String.fromCharCode((b[c>>5]>>>(c%32))&255)}
return a}
function binl_md5(p,k){p[k>>5]|=128<<((k)%32);p[(((k+64)>>>9)<<4)+14]=k;var o=1732584193;var n=-271733879;var m=-1732584194;var l=271733878;for(var g=0;g<p.length;g+=16){var j=o;var h=n;var f=m;var e=l;o=md5_ff(o,n,m,l,p[g+0],7,-680876936);l=md5_ff(l,o,n,m,p[g+1],12,-389564586);m=md5_ff(m,l,o,n,p[g+2],17,606105819);n=md5_ff(n,m,l,o,p[g+3],22,-1044525330);o=md5_ff(o,n,m,l,p[g+4],7,-176418897);l=md5_ff(l,o,n,m,p[g+5],12,1200080426);m=md5_ff(m,l,o,n,p[g+6],17,-1473231341);n=md5_ff(n,m,l,o,p[g+7],22,-45705983);o=md5_ff(o,n,m,l,p[g+8],7,1770035416);l=md5_ff(l,o,n,m,p[g+9],12,-1958414417);m=md5_ff(m,l,o,n,p[g+10],17,-42063);n=md5_ff(n,m,l,o,p[g+11],22,-1990404162);o=md5_ff(o,n,m,l,p[g+12],7,1804603682);l=md5_ff(l,o,n,m,p[g+13],12,-40341101);m=md5_ff(m,l,o,n,p[g+14],17,-1502002290);n=md5_ff(n,m,l,o,p[g+15],22,1236535329);o=md5_gg(o,n,m,l,p[g+1],5,-165796510);l=md5_gg(l,o,n,m,p[g+6],9,-1069501632);m=md5_gg(m,l,o,n,p[g+11],14,643717713);n=md5_gg(n,m,l,o,p[g+0],20,-373897302);o=md5_gg(o,n,m,l,p[g+5],5,-701558691);l=md5_gg(l,o,n,m,p[g+10],9,38016083);m=md5_gg(m,l,o,n,p[g+15],14,-660478335);n=md5_gg(n,m,l,o,p[g+4],20,-405537848);o=md5_gg(o,n,m,l,p[g+9],5,568446438);l=md5_gg(l,o,n,m,p[g+14],9,-1019803690);m=md5_gg(m,l,o,n,p[g+3],14,-187363961);n=md5_gg(n,m,l,o,p[g+8],20,1163531501);o=md5_gg(o,n,m,l,p[g+13],5,-1444681467);l=md5_gg(l,o,n,m,p[g+2],9,-51403784);m=md5_gg(m,l,o,n,p[g+7],14,1735328473);n=md5_gg(n,m,l,o,p[g+12],20,-1926607734);o=md5_hh(o,n,m,l,p[g+5],4,-378558);l=md5_hh(l,o,n,m,p[g+8],11,-2022574463);m=md5_hh(m,l,o,n,p[g+11],16,1839030562);n=md5_hh(n,m,l,o,p[g+14],23,-35309556);o=md5_hh(o,n,m,l,p[g+1],4,-1530992060);l=md5_hh(l,o,n,m,p[g+4],11,1272893353);m=md5_hh(m,l,o,n,p[g+7],16,-155497632);n=md5_hh(n,m,l,o,p[g+10],23,-1094730640);o=md5_hh(o,n,m,l,p[g+13],4,681279174);l=md5_hh(l,o,n,m,p[g+0],11,-358537222);m=md5_hh(m,l,o,n,p[g+3],16,-722521979);n=md5_hh(n,m,l,o,p[g+6],23,76029189);o=md5_hh(o,n,m,l,p[g+9],4,-640364487);l=md5_hh(l,o,n,m,p[g+12],11,-421815835);m=md5_hh(m,l,o,n,p[g+15],16,530742520);n=md5_hh(n,m,l,o,p[g+2],23,-995338651);o=md5_ii(o,n,m,l,p[g+0],6,-198630844);l=md5_ii(l,o,n,m,p[g+7],10,1126891415);m=md5_ii(m,l,o,n,p[g+14],15,-1416354905);n=md5_ii(n,m,l,o,p[g+5],21,-57434055);o=md5_ii(o,n,m,l,p[g+12],6,1700485571);l=md5_ii(l,o,n,m,p[g+3],10,-1894986606);m=md5_ii(m,l,o,n,p[g+10],15,-1051523);n=md5_ii(n,m,l,o,p[g+1],21,-2054922799);o=md5_ii(o,n,m,l,p[g+8],6,1873313359);l=md5_ii(l,o,n,m,p[g+15],10,-30611744);m=md5_ii(m,l,o,n,p[g+6],15,-1560198380);n=md5_ii(n,m,l,o,p[g+13],21,1309151649);o=md5_ii(o,n,m,l,p[g+4],6,-145523070);l=md5_ii(l,o,n,m,p[g+11],10,-1120210379);m=md5_ii(m,l,o,n,p[g+2],15,718787259);n=md5_ii(n,m,l,o,p[g+9],21,-343485551);o=safe_add(o,j);n=safe_add(n,h);m=safe_add(m,f);l=safe_add(l,e)}
return Array(o,n,m,l)}
function md5_cmn(h,e,d,c,g,f){return safe_add(bit_rol(safe_add(safe_add(e,h),safe_add(c,f)),g),d)}
function md5_ff(g,f,k,j,e,i,h){return md5_cmn((f&k)|((~f)&j),g,f,e,i,h)}
function md5_gg(g,f,k,j,e,i,h){return md5_cmn((f&j)|(k&(~j)),g,f,e,i,h)}
function md5_hh(g,f,k,j,e,i,h){return md5_cmn(f^k^j,g,f,e,i,h)}
function md5_ii(g,f,k,j,e,i,h){return md5_cmn(k^(f|(~j)),g,f,e,i,h)}
function safe_add(a,d){var c=(a&65535)+(d&65535);var b=(a>>16)+(d>>16)+(c>>16);return(b<<16)|(c&65535)}
function bit_rol(a,b){return(a<<b)|(a>>>(32-b))};

//https://github.com/douglascrockford/JSON-js/blob/master/json2.js
if(typeof JSON!=='object'){JSON={};}
(function(){'use strict';function f(n){return n<10?'0'+n:n;}
if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf();};}
var cx,escapable,gap,indent,meta,rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
if(typeof rep==='function'){value=rep.call(holder,key,value);}
switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
if(typeof JSON.stringify!=='function'){escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
return str('',{'':value});};}
if(typeof JSON.parse!=='function'){cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
throw new SyntaxError('JSON.parse');};}}());