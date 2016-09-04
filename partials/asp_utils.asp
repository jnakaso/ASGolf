<%
function GetStringOrBlank (aString)
	if isEmpty(aString) then
		GetStringOrBlank = "&nbsp;"
	else
		GetStringOrBlank = aString
	end if
end function

function GetRowStyle(light)
	if (light) then
		GetRowStyle = "lightRow"
	else
		GetRowStyle = "darkRow"
	end if
end function

function GetSort()
	sortString = request("sort")
	if isEmpty(sortString) then
		GetSort = "CompareByHDCP"
	else 
		GetSort = sortString
	end if
end function

function GetSeason()
	seasonString = request("season")
	if isEmpty(seasonString) then
		GetSeason = gCurrentSeason
	else 
		GetSeason = CInt(seasonString)
	end if
end function

sub DrawSeasonMenu (selectedSeason, changeFunction)
	response.write "<div id=""seasonMenu"" >"
	response.write "<form name=""SeasonMenu"" style=""margin:0px"" >"
	response.write "<b>Select a season:</b>&nbsp;"
	response.write "<select id=""SeasonList"" name=""SeasonList"" onchange=""" & changeFunction & ";"">"
	for season = gCurrentSeason to gFirstSeason step -1
		response.write "<option value=""" & season & """"
		if not StrComp(season, selectedSeason)  then
			response.write " selected"
		end if
		response.write ">" & season & "</option>"
	next
	response.write "</select>"
	response.write "</form>"
	response.write "</div>"
end sub

%>