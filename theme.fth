�����6J�A_s��!   -�p6�,bG��$@��Q�b   Lv?%��Tq���       V   %codec% | %bitrate% kbps | %samplerate% Hz | %channels% | %playback_time%[ / %length%]F��OմLH��.�� JIp  CZ�q.�ɥb� ���       �t�o�@����LQ�9         :��$��O���j���       �      (�7�_tC�l/���Ө   (�7�_tC�l/���Ө;�ӯԆE��N���   ;�ӯԆE��N���bR���.E�'�N���   bR���.E�'�N���fE�G�N�9j�����   fE�G�N�9j����Ƞ����E��@��r�   �����E��@��r�e��B�0�@��jN/+,�   e��B�0�@��jN/+,��@5�W�A�NG�C#���           M{�t��}@��zX�_~          �`wEd�I�������          QiDUN�Y���C,  ���PΔp=G��!���   ��rh�J�#�$�N��X  �nlj�6�O�7d{�]�&Q�u��NXB��A�:T�;����VG������Li  �           �LQ�N�?~u���   Library         by folder structure�Y�y�S@��;[
�Vf	   Playlists        ���������������������������������  <F>E-Autoplaylists
<P>2-#games-new
<P>3-#games
<P>4-#films
<P>5-#best-games-new
</F>
<F>E-Top Tracks
<P>12-Akira Yamaoka
<P>13-Golliwog
<P>14-Santaolalla
<P>15-Hawthorne Heights
</F>
<F>E-Moods
<P>18-joy
<P>0-motivation
</F>
<F>E-Other
<P>16-PS one
</F>
<F>E-New
<P>1-radio
<P>6-fantasy
<P>7-Jeremy Soule
<P>8-played
<P>9-Greg Edmonson
<P>10-Offspring old days
<P>11-loved
<P>17-FREE
</F>
<F>N-New
</F>
<P>19-'Darkman007' Top Tracks
<P>20-'Alexandre Desplat' Top Tracks
   ���.hx�L�w��H�3�nlj�6�O�7d{�]�&���`E�Q��T��  e   �  )�����TG�0��ʵ'���.hx�L�w��H�3�  �  �  
       ޾M�o��H����R)t�        /   `       I6��tO�B���#��           `       C����+M�����E�!        �   `       ]�F��iO�e_� �T        �   `       �X��;�H��<��l�0        +   `       ��%@�G���QH        �   `       IN���PD�8��E��        2   `                         RatingD   $if(%rating%,$repeat(●,%rating%)$repeat(o,$sub(5,%rating%)),ooooo)d   `                         Genre   %genre%d   `                         last   [%LASTFM_PLAYCOUNT_DB%]d   `                   Q�u��NXB��A�:T�\脝�o�O��;qϸʉ     �        C��%WKI��"��?   Info      m�S�@���뉡=�   Lyrics�  P                      �A< #U} ��� ����            �     �    M S   S h e l l   D l g                                         �   Artist: %artist%$crlf()Title: %title%$crlf()Album: %album%$crlf()%playback_time% / %length%[$crlf()%search_state%][%search_progress%'%']����            �     �    M S   S h e l l   D l g                                                                   �@       ) y�΄ǐ��q[������@��      ����}�D�ٟ:����   New Tabq	  {    b�v���I���I��       2K3.LIST.LASTFM.ARTIST.METHOD       2K3.LIST.LASTFM.CHARTS.COLOUR    60-60-60   2K3.LIST.LASTFM.CHARTS.METHOD        2K3.LIST.LASTFM.CHARTS.PERIOD       2K3.LIST.LASTFM.MODE       2K3.LIST.MUSICBRAINZ.MODE        2K3.LIST.MUSICBRAINZ.SHOW.ICONS ��   2K3.LISTENBRAINZ.LIBRARY      2K3.LISTENBRAINZ.LOG.DATA ��   2K3.LISTENBRAINZ.SHOW.DATA      2K3.LISTENBRAINZ.SUBMIT.GENRES ��   2K3.PANEL.ARTIST.TF    $meta(artist,0)   2K3.PANEL.COLOURS.CUSTOM    0-0-0   2K3.PANEL.COLOURS.MODE       2K3.PANEL.FONTS.SIZE 
      2K3.PANEL.SELECTION        2K3.TEXT.BIO.LASTFM.SITE        2K3.TOOLTIP.FONT.NAME    Segoe UI   2K3.TOOLTIP.FONT.SIZE       2K3.TOOLTIP.FONT.STYLE       ,          ����������������    &   .  u     JScript9M  // ==PREPROCESSOR==
// @name "Last.fm Artist Info/User Charts/Recent Tracks"
// @author "marc2003"
// @import "%fb2k_profile_path%js_marc2003\js\lodash.min.js"
// @import "%fb2k_profile_path%js_marc2003\js\helpers.js"
// @import "%fb2k_profile_path%js_marc2003\js\panel.js"
// @import "%fb2k_profile_path%js_marc2003\js\lastfm.js"
// @import "%fb2k_profile_path%js_marc2003\js\list.js"
// ==/PREPROCESSOR==

var panel = new _.panel("Last.fm Artist Info/User Charts/Recent Tracks", ["metadb", "remap"]);
var lastfm = new _.lastfm();
//lastfm.api_key = "abc123"; //uncomment this and edit accordingly.
var list = new _.list("lastfm_info", 10, 24, 0, 0);

panel.item_focus_change();

function on_notify_data(name, data) {
	lastfm.notify_data(name, data);
}

function on_size() {
	panel.size();
	list.w = panel.w - 20;
	list.h = panel.h - 24;
	list.size();
}

function on_paint(gr) {
	panel.paint(gr);
	gr.FillSolidRect(0, 0, panel.w, 24, panel.colours.header);
	gr.GdiDrawText(list.header_text(), panel.fonts.title, panel.colours.highlight, 10, 0, panel.w - 20, 24, LEFT);
	list.paint(gr);
}

function on_metadb_changed() {
	list.metadb_changed();
}

function on_playback_new_track() {
	list.playback_new_track();
}

function on_playback_time() {
	list.playback_time();
}

function on_mouse_wheel(s) {
	list.wheel(s);
}

function on_mouse_move(x, y) {
	list.move(x, y);
}

function on_mouse_lbtn_up(x, y) {
	list.lbtn_up(x, y);
}

function on_key_down(k) {
	list.key_down(k);
}

function on_mouse_rbtn_up(x, y) {
	return panel.rbtn_up(x, y, list);
}
    No��	��K��g�>�D^`   ��������`   ��������                  ����   %artist% %album% %title%   Standard                    ����������������`   ��������`   ������������B��%gq�ݨ     C��%WKI��"��?   Selection Properties)�����TG�0��ʵ'   Playlist View;����VG������L   Playlist Tabs���`E�Q��T�   Quicksearch����}�D�ٟ:����   JScript Panel�Y�y�S@��;[
�Vf   Playlist Organizerm�S�@���뉡=�   Lyrics Show Panel v3���.hx�L�w��H�3   Splitter (top/bottom)�nlj�6�O�7d{�]�&   Splitter (left/right)\脝�o�O��;qϸ�   Album Art Viewer�LQ�N�?~u���
   Album ListQ�u��NXB��A�:T�   TabsW��w/�@�MR}at*   ����C)w2�-���rb    ��Y���H���[�b-T   � ���z�a&�W�[�,   ��]��oA�-��1���   ��@���C�;�2n5����B���j>:B�fe��u� f̀k���
~�F����@�3���